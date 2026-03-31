import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createServer as createHttpServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import Stripe from "stripe";
import twilio from "twilio";

dotenv.config();

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const twilioClient = process.env.TWILIO_ACCOUNT_SID?.startsWith('AC') && process.env.TWILIO_AUTH_TOKEN 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) 
  : null;

async function startServer() {
  const app = express();
  const httpServer = createHttpServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
  const PORT = 3000;

  app.use(express.json());

  // Payment endpoint
  app.post("/api/create-payment-intent", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe not configured" });
    }
    const { amount } = req.body;
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "inr",
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // SMS endpoint
  app.post("/api/send-sms", async (req, res) => {
    if (!twilioClient) {
      return res.status(500).json({ error: "Twilio not configured" });
    }
    const { to, message } = req.body;
    try {
      await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: to
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // In-memory message store
  const messages: any[] = [];
  // In-memory booking store
  const bookings: any[] = [];
  // In-memory driver applications store
  const driverApplications: any[] = [];

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Send existing messages to the newly connected user
    socket.emit("chat_history", messages);
    // Send existing bookings to the newly connected driver/operator
    socket.emit("booking_history", bookings);
    // Send existing driver applications to operator
    socket.emit("driver_applications_history", driverApplications);

    socket.on("send_message", (data) => {
      const newMessage = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString()
      };
      messages.push(newMessage);
      io.emit("receive_message", newMessage);
    });

    socket.on("create_booking", (data) => {
      const newBooking = {
        ...data,
        status: "Pending",
        timestamp: new Date().toISOString()
      };
      bookings.push(newBooking);
      io.emit("new_booking", newBooking);
    });

    socket.on("update_booking_status", (data) => {
      const { bookingId, status, driverName, vehicleNumber, driverPhoto } = data;
      const bookingIndex = bookings.findIndex(b => b.id === bookingId);
      if (bookingIndex !== -1) {
        bookings[bookingIndex].status = status;
        if (driverName) bookings[bookingIndex].driverName = driverName;
        if (vehicleNumber) bookings[bookingIndex].vehicleNumber = vehicleNumber;
        if (driverPhoto) bookings[bookingIndex].driverPhoto = driverPhoto;
        io.emit("booking_status_updated", bookings[bookingIndex]);
      }
    });

    socket.on("cancel_booking", (data) => {
      const { bookingId } = data;
      const bookingIndex = bookings.findIndex(b => b.id === bookingId);
      if (bookingIndex !== -1) {
        bookings[bookingIndex].status = "Cancelled";
        io.emit("booking_status_updated", bookings[bookingIndex]);
      }
    });

    socket.on("driver_location_update", (data) => {
      const { bookingId, location } = data;
      const bookingIndex = bookings.findIndex(b => b.id === bookingId);
      if (bookingIndex !== -1) {
        bookings[bookingIndex].driverLocation = location;
        io.emit("driver_location_updated", { bookingId, location });
      }
    });

    socket.on("submit_driver_application", (data) => {
      const newApp = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        status: "Pending",
        timestamp: new Date().toISOString()
      };
      driverApplications.push(newApp);
      io.emit("new_driver_application", newApp);
    });

    socket.on("update_application_status", (data) => {
      const { id, status } = data;
      const appIndex = driverApplications.findIndex(a => a.id === id);
      if (appIndex !== -1) {
        driverApplications[appIndex].status = status;
        io.emit("application_status_updated", driverApplications[appIndex]);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // API Route for Distance Calculation
  app.post("/api/distance", async (req, res) => {
    const { origin, destination } = req.body;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Google Maps API Key is missing in server environment." });
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && data.rows[0].elements[0].status === "OK") {
        const distanceInMeters = data.rows[0].elements[0].distance.value;
        const distanceInKm = Math.ceil(distanceInMeters / 1000);
        res.json({ distance: distanceInKm });
      } else {
        res.status(400).json({ error: "Could not calculate distance. Please check locations." });
      }
    } catch (error) {
      console.error("Distance API Error:", error);
      res.status(500).json({ error: "Internal server error during distance calculation." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
