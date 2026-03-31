/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  Car, 
  ShieldCheck, 
  Clock4, 
  ChevronRight, 
  Star,
  Menu,
  X,
  Plane,
  ArrowRight,
  MessageCircle,
  Fuel,
  Gauge,
  Zap,
  Info,
  Smartphone,
  Mail,
  LayoutDashboard,
  History,
  TrendingUp,
  Users,
  Send,
  User,
  Navigation,
  Search,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { io } from 'socket.io-client';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet's default icon path issues with Webpack/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const socket = io();

const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

// --- Components ---

const BhopalLogo = ({ size = 40, className = "" }: { size?: number, className?: string }) => (
  <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
      {/* Main Square with rounded corners */}
      <rect x="5" y="5" width="90" height="90" rx="24" fill="#FF6321" />
      
      {/* Stylized Waves at the bottom (City of Lakes) */}
      <path 
        d="M20 70 Q 35 60, 50 70 T 80 70" 
        fill="none" 
        stroke="white" 
        strokeWidth="5" 
        strokeLinecap="round"
      />
      <path 
        d="M20 80 Q 35 70, 50 80 T 80 80" 
        fill="none" 
        stroke="white" 
        strokeWidth="3" 
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* The 'T' for Tathastu */}
      <text 
        x="50" 
        y="58" 
        textAnchor="middle" 
        fill="white" 
        fontSize="52" 
        fontWeight="900" 
        fontFamily="system-ui, sans-serif"
      >
        T
      </text>

      {/* Small Taxi Roof Light Indicator */}
      <rect x="40" y="15" width="20" height="6" rx="2" fill="white" />
    </svg>
  </div>
);

const ConfirmationModal = ({ isOpen, onClose, details }: { isOpen: boolean, onClose: () => void, details: any }) => {
  if (!details) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-dark/80 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl p-8 text-center"
          >
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck size={40} />
            </div>
            
            <h3 className="text-2xl font-bold text-brand-dark mb-2">Booking Confirmed!</h3>
            <p className="text-slate-500 mb-6">Your booking has been recorded in our system. Once a driver is assigned, you will see their details here.</p>
            
            {details.driverName && (
              <div className="bg-orange-50 rounded-3xl p-6 mb-6 border border-brand-orange/20 text-left">
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src={details.driverPhoto || 'https://images.unsplash.com/photo-1591035897819-f4bdf739f446?auto=format&fit=crop&q=80&w=200&h=200'} 
                    alt={details.driverName} 
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <p className="text-[10px] font-bold text-brand-orange uppercase tracking-widest">Assigned Driver</p>
                    <h4 className="text-lg font-bold text-brand-dark">{details.driverName}</h4>
                    <p className="text-sm font-bold text-slate-500">{details.vehicleNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-green-600 bg-white px-3 py-2 rounded-xl border border-green-100">
                  <ShieldCheck size={14} /> Driver is verified and on the way
                </div>
              </div>
            )}

            {details.driverLocation && (
              <div className="mb-6 rounded-3xl overflow-hidden border border-slate-200 h-48 relative">
                <MapContainer 
                  center={[details.driverLocation.latitude, details.driverLocation.longitude]} 
                  zoom={15} 
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={false}
                >
                  <MapUpdater center={[details.driverLocation.latitude, details.driverLocation.longitude]} />
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={[details.driverLocation.latitude, details.driverLocation.longitude]}>
                    <Popup>
                      <div className="text-center">
                        <p className="font-bold text-brand-dark">{details.driverName}</p>
                        <p className="text-xs text-slate-500">Current Location</p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
                <div className="absolute top-2 left-2 z-[400] bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] font-bold text-brand-dark shadow-sm flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Live Tracking
                </div>
              </div>
            )}

            <div className="bg-slate-50 rounded-3xl p-6 mb-8 text-left space-y-3 border border-slate-100">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Confirmation ID</span>
                <span className="text-sm font-mono font-bold text-brand-orange">{details.id}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Pickup</p>
                  <p className="text-sm font-bold truncate">{details.pickup || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Drop</p>
                  <p className="text-sm font-bold truncate">{details.drop || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Date & Time</p>
                  <p className="text-sm font-bold">{details.date || 'N/A'} | {details.time || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Vehicle</p>
                  <p className="text-sm font-bold">{details.carType || details.carName || 'N/A'}</p>
                </div>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="w-full bg-brand-dark text-white py-4 rounded-2xl font-bold hover:bg-brand-orange transition-all"
            >
              Got it, thanks!
            </button>
            
            <p className="mt-6 text-[10px] text-slate-400 font-medium">
              Our team will confirm your ride shortly on WhatsApp.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const AvailabilityCalendar = ({ bookedDates }: { bookedDates: string[] }) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  const monthName = today.toLocaleString('default', { month: 'long' });
  
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
  }
  
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isBooked = bookedDates.includes(dateStr);
    const isToday = d === today.getDate();
    
    days.push(
      <div 
        key={d} 
        className={cn(
          "h-8 w-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all",
          isBooked ? "bg-red-100 text-red-600" : "bg-green-50 text-green-600",
          isToday && "ring-2 ring-brand-orange ring-offset-1"
        )}
        title={isBooked ? "Booked" : "Available"}
      >
        {d}
      </div>
    );
  }

  return (
    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-brand-dark">{monthName} {currentYear}</h4>
        <div className="flex gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Free</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Booked</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
          <div key={day} className="text-[10px] font-bold text-slate-300">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days}
      </div>
    </div>
  );
};

const VehicleModal = ({ car, isOpen, onClose, onBookingComplete }: { car: any, isOpen: boolean, onClose: () => void, onBookingComplete: (details: any) => void }) => {
  if (!car) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white w-full max-w-2xl rounded-[2rem] overflow-hidden shadow-2xl"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 z-10 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-brand-dark hover:bg-brand-orange hover:text-white transition-all"
            >
              <X size={20} />
            </button>

            <div className="grid md:grid-cols-2">
              <div className="h-64 md:h-full relative">
                <img 
                  src={car.img} 
                  alt={car.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 bg-brand-orange text-white px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                  {car.type}
                </div>
              </div>

              <div className="p-8 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-3xl font-bold">{car.name}</h3>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                    car.status === 'Available' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                  )}>
                    {car.status}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Outstation</p>
                    <p className="text-xl font-bold text-brand-orange">{car.price}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Local (8h/80km)</p>
                    <p className="text-xl font-bold text-brand-dark">{car.localPrice}</p>
                  </div>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl mb-6 border border-orange-100">
                  <p className="text-xs text-brand-orange font-bold uppercase mb-1">Important Note</p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    * Toll, Parking and State Tax charges will be extra as per actuals.<br />
                    * Pickup and Drop within Bhopal: Minimum 30 kilometers will be charged for distances below 10km.<br />
                    * Outstation Drop: Return kilometer charges will apply for one-way drops.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                    <Fuel className="text-slate-400" size={18} />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Fuel Type</p>
                      <p className="text-sm font-bold">{car.details.fuel}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                    <Gauge className="text-slate-400" size={18} />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Mileage</p>
                      <p className="text-sm font-bold">{car.details.mileage}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                    <Star className="text-slate-400" size={18} />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Capacity</p>
                      <p className="text-sm font-bold">{car.capacity}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                    <Zap className="text-slate-400" size={18} />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Transmission</p>
                      <p className="text-sm font-bold">{car.details.transmission}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <p className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-widest">Availability Calendar</p>
                  <AvailabilityCalendar bookedDates={car.bookedDates} />
                </div>

                {car.location && (
                  <div className="mb-8">
                    <p className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-widest">Current Vehicle Location</p>
                    <div className="rounded-3xl overflow-hidden border border-slate-200 h-48 relative">
                      <MapContainer 
                        center={[car.location.latitude, car.location.longitude]} 
                        zoom={15} 
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={false}
                      >
                        <MapUpdater center={[car.location.latitude, car.location.longitude]} />
                        <TileLayer
                          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <Marker position={[car.location.latitude, car.location.longitude]}>
                          <Popup>
                            <div className="text-center">
                              <p className="font-bold text-brand-dark">{car.name}</p>
                              <p className="text-xs text-slate-500">Current Location</p>
                            </div>
                          </Popup>
                        </Marker>
                      </MapContainer>
                      <div className="absolute top-2 left-2 z-[400] bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] font-bold text-brand-dark shadow-sm flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Live Tracking
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-8">
                  <p className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-widest">Key Features</p>
                  <div className="flex flex-wrap gap-2">
                    {car.details.features.map((feature: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-widest">Pickup Location</p>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition((pos) => {
                            const { latitude, longitude } = pos.coords;
                            (window as any).currentCustomerLocation = { latitude, longitude };
                            alert("Location captured successfully!");
                          });
                        }
                      }}
                      className="flex-1 bg-white border border-slate-200 py-3 rounded-xl text-xs font-bold text-brand-dark hover:bg-slate-50 flex items-center justify-center gap-2"
                    >
                      <MapPin size={14} className="text-brand-orange" /> Share Current Location
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 italic">* Sharing location helps the driver reach you faster via GPS.</p>
                </div>

                <button 
                  onClick={() => {
                    const bookingId = `TT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
                    onBookingComplete({ 
                      carName: car.name, 
                      carType: car.type,
                      id: bookingId,
                      total: car.localPrice.replace('₹', ''),
                      rate: car.price,
                      date: new Date().toLocaleDateString(),
                      time: new Date().toLocaleTimeString(),
                      pickup: 'Current Location / Local Inquiry',
                      drop: 'Local Inquiry',
                      location: (window as any).currentCustomerLocation
                    });
                  }}
                  className="w-full bg-brand-dark text-white py-4 rounded-2xl font-bold hover:bg-brand-orange transition-all flex items-center justify-center gap-2"
                >
                  Book This Vehicle <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Navbar = ({ deferredPrompt, onInstall, setView }: { deferredPrompt: any, onInstall: () => void, setView: (view: 'customer' | 'operator' | 'driver') => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-3">
            <BhopalLogo size={44} />
            <span className="text-xl font-bold tracking-tight text-brand-dark">Tathastu <span className="text-brand-orange">Travels</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-sm font-medium hover:text-brand-orange transition-colors">Home</a>
            <a href="#fleet" className="text-sm font-medium hover:text-brand-orange transition-colors">Our Fleet</a>
            <a href="#testimonials" className="text-sm font-medium hover:text-brand-orange transition-colors">Reviews</a>
            <a href="#faq" className="text-sm font-medium hover:text-brand-orange transition-colors">FAQ</a>
            
            {deferredPrompt && (
              <button 
                onClick={onInstall}
                className="bg-brand-orange/10 text-brand-orange px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-brand-orange hover:text-white transition-all animate-pulse"
              >
                <Smartphone size={14} /> Install App
              </button>
            )}

            <a 
              href="tel:+919754364899" 
              className="bg-brand-dark text-white px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-brand-orange transition-all"
            >
              <Phone size={16} /> Call Now
            </a>
          </div>

          <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              <a href="#home" className="block px-3 py-4 text-base font-medium border-b border-slate-50" onClick={() => setIsOpen(false)}>Home</a>
              <a href="#fleet" className="block px-3 py-4 text-base font-medium border-b border-slate-50" onClick={() => setIsOpen(false)}>Our Fleet</a>
              <a href="#testimonials" className="block px-3 py-4 text-base font-medium border-b border-slate-50" onClick={() => setIsOpen(false)}>Reviews</a>
              <a href="#faq" className="block px-3 py-4 text-base font-medium border-b border-slate-50" onClick={() => setIsOpen(false)}>FAQ</a>
              <a href="#contact" className="block px-3 py-4 text-base font-medium border-b border-slate-50" onClick={() => setIsOpen(false)}>Contact</a>
              
              {deferredPrompt && (
                <button 
                  onClick={() => { onInstall(); setIsOpen(false); }}
                  className="w-full bg-slate-100 text-brand-dark py-4 rounded-xl font-bold flex items-center justify-center gap-2 mb-2"
                >
                  <Smartphone size={20} /> Install Tathastu App
                </button>
              )}

              <div className="pt-4">
                <a href="tel:+919754364899" className="w-full bg-brand-orange text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                  <Phone size={20} /> Call Now
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe((import.meta as any).env.VITE_STRIPE_PUBLIC_KEY || '');

const PaymentForm = ({ amount, onPaymentSuccess }: { amount: number, onPaymentSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsProcessing(true);

    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    });
    const { clientSecret } = await response.json();

    const cardElement = elements.getElement(CardElement) as any;
    if (!cardElement) return;

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement }
    });

    setIsProcessing(false);
    if (result.error) {
      alert(result.error.message);
    } else {
      onPaymentSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
        <CardElement />
      </div>
      <button disabled={isProcessing} className="w-full bg-brand-dark text-white py-3 rounded-xl font-bold hover:bg-brand-orange">
        {isProcessing ? 'Processing...' : `Pay ₹${amount}`}
      </button>
    </form>
  );
};

const BookingForm = ({ onBookingComplete }: { onBookingComplete: (details: any) => void }) => {
  const [formData, setFormData] = useState({
    pickup: '',
    drop: '',
    date: '',
    time: '',
    carType: 'Sedan (Swift Dzire) - ₹11/km',
    kilometers: '',
    tripType: 'One Way',
    rideCategory: 'Local',
    phone: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCalculating, setIsCalculating] = useState(false);

  const carRates: Record<string, number> = {
    'Hatchback (Alto) - ₹9/km': 9,
    'Hatchback (S-Presso) - ₹10/km': 10,
    'Sedan (Swift Dzire) - ₹11/km': 11,
    'SUV (Ertiga) - ₹13/km': 13
  };

  const calculateTotal = () => {
    const rate = carRates[formData.carType];
    let kms = parseFloat(formData.kilometers);
    if (isNaN(kms)) return 0;
    
    // If Outstation and One Way, add return distance (double the kms)
    if (formData.rideCategory === 'Outstation' && formData.tripType === 'One Way') {
      kms = kms * 2;
    }
    
    return rate * kms;
  };

  const fetchDistance = async () => {
    if (!formData.pickup || !formData.drop) return;
    
    setIsCalculating(true);
    try {
      const response = await fetch('/api/distance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin: formData.pickup, destination: formData.drop })
      });
      const data = await response.json();
      if (data.distance) {
        setFormData(prev => ({ ...prev, kilometers: data.distance.toString() }));
      }
    } catch (error) {
      console.error("Failed to fetch distance:", error);
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.pickup.length > 3 && formData.drop.length > 3) {
        fetchDistance();
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [formData.pickup, formData.drop]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const now = new Date();
    const selectedDate = new Date(formData.date);
    
    // Reset time to midnight for date comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const bookingDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());

    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else if (bookingDate < today) {
      newErrors.date = 'Date cannot be in the past';
    }

    if (!formData.time) {
      newErrors.time = 'Time is required';
    } else if (formData.date && bookingDate.getTime() === today.getTime()) {
      // If today, check if time is at least 30 mins from now
      const [hours, minutes] = formData.time.split(':').map(Number);
      const bookingTime = new Date(today);
      bookingTime.setHours(hours, minutes);

      const minBookingTime = new Date(now.getTime() + 30 * 60000);
      if (bookingTime < minBookingTime) {
        newErrors.time = 'Bookings must be at least 30 mins in advance';
      }
    }

    if (!formData.pickup.trim()) newErrors.pickup = 'Pickup location is required';
    if (!formData.drop.trim()) newErrors.drop = 'Drop location is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [bookingDetails, setBookingDetails] = useState<any>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const bookingId = `TT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const rate = carRates[formData.carType];
      const total = calculateTotal();
      const kms = parseFloat(formData.kilometers);
      
      setBookingDetails({ 
        ...formData, 
        id: bookingId,
        total: total,
        rate: rate,
        kms: kms
      });
    }
  };

  if (bookingDetails) {
    return (
      <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100">
        <h3 className="text-2xl font-bold mb-6">Complete Payment</h3>
        <p className="mb-6 text-slate-600">Total amount: <span className="font-bold text-brand-dark">₹{bookingDetails.total}</span></p>
        <Elements stripe={stripePromise}>
          <PaymentForm amount={bookingDetails.total} onPaymentSuccess={() => onBookingComplete(bookingDetails)} />
        </Elements>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100">
      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Car className="text-brand-orange" /> Quick Booking
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Ride Category</label>
          <div className="flex gap-4">
            {['Local', 'Outstation'].map((category) => (
              <label key={category} className="flex-1 cursor-pointer">
                <input 
                  type="radio" 
                  name="rideCategory" 
                  className="hidden peer" 
                  checked={formData.rideCategory === category}
                  onChange={() => setFormData({...formData, rideCategory: category})}
                />
                <div className="py-3 text-center border border-slate-200 rounded-xl peer-checked:border-brand-orange peer-checked:bg-brand-orange/5 peer-checked:text-brand-orange font-bold text-sm transition-all">
                  {category}
                </div>
              </label>
            ))}
          </div>
        </div>

        {formData.rideCategory === 'Outstation' && (
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Trip Type</label>
            <div className="flex gap-4">
              {['One Way', 'Round Trip'].map((type) => (
                <label key={type} className="flex-1 cursor-pointer">
                  <input 
                    type="radio" 
                    name="tripType" 
                    className="hidden peer" 
                    checked={formData.tripType === type}
                    onChange={() => setFormData({...formData, tripType: type})}
                  />
                  <div className="py-3 text-center border border-slate-200 rounded-xl peer-checked:border-brand-orange peer-checked:bg-brand-orange/5 peer-checked:text-brand-orange font-bold text-sm transition-all">
                    {type}
                  </div>
                </label>
              ))}
            </div>
            <p className="text-[9px] text-slate-500 mt-1">
              {formData.tripType === 'One Way' ? "* One Way drop mein return kilometer ka charge bhi lagega." : "* Round trip mein aane-jaane dono ka charge lagega."}
            </p>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Phone Number</label>
          <div className="relative">
            <input 
              type="tel" 
              placeholder="e.g. 9876543210"
              className={cn(
                "w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all",
                errors.phone ? "border-red-500" : "border-slate-200"
              )}
              value={formData.phone}
              onChange={(e) => {
                setFormData({...formData, phone: e.target.value});
                if (errors.phone) setErrors({...errors, phone: ''});
              }}
            />
          </div>
          {errors.phone && <p className="text-[10px] text-red-500 font-bold uppercase mt-1">{errors.phone}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Pickup Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="e.g. Raja Bhoj Airport, Bhopal"
              className={cn(
                "w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all",
                errors.pickup ? "border-red-500" : "border-slate-200"
              )}
              value={formData.pickup}
              onChange={(e) => {
                setFormData({...formData, pickup: e.target.value});
                if (errors.pickup) setErrors({...errors, pickup: ''});
              }}
            />
          </div>
          {errors.pickup && <p className="text-[10px] text-red-500 font-bold uppercase mt-1">{errors.pickup}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Drop Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="e.g. Indore Airport"
              className={cn(
                "w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all",
                errors.drop ? "border-red-500" : "border-slate-200"
              )}
              value={formData.drop}
              onChange={(e) => {
                setFormData({...formData, drop: e.target.value});
                if (errors.drop) setErrors({...errors, drop: ''});
              }}
            />
          </div>
          {errors.drop && <p className="text-[10px] text-red-500 font-bold uppercase mt-1">{errors.drop}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="date" 
                className={cn(
                  "w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all",
                  errors.date ? "border-red-500" : "border-slate-200"
                )}
                value={formData.date}
                onChange={(e) => {
                  setFormData({...formData, date: e.target.value});
                  if (errors.date) setErrors({...errors, date: ''});
                }}
              />
            </div>
            {errors.date && <p className="text-[10px] text-red-500 font-bold uppercase mt-1">{errors.date}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Time</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="time" 
                className={cn(
                  "w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all",
                  errors.time ? "border-red-500" : "border-slate-200"
                )}
                value={formData.time}
                onChange={(e) => {
                  setFormData({...formData, time: e.target.value});
                  if (errors.time) setErrors({...errors, time: ''});
                }}
              />
            </div>
            {errors.time && <p className="text-[10px] text-red-500 font-bold uppercase mt-1">{errors.time}</p>}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Vehicle Type & Rate</label>
          <select 
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all appearance-none"
            value={formData.carType}
            onChange={(e) => setFormData({...formData, carType: e.target.value})}
          >
            <option>Hatchback (Alto) - ₹9/km</option>
            <option>Hatchback (S-Presso) - ₹10/km</option>
            <option>Sedan (Swift Dzire) - ₹11/km</option>
            <option>SUV (Ertiga) - ₹13/km</option>
          </select>
          <p className="text-[10px] text-slate-500 mt-1">* Toll, Parking & State Tax extra as applicable.</p>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Estimated Kilometers (Google Maps)</label>
          <div className="relative">
            <Gauge className={cn("absolute left-3 top-1/2 -translate-y-1/2", isCalculating ? "text-brand-orange animate-spin" : "text-slate-400")} size={18} />
            <input 
              type="number" 
              placeholder={isCalculating ? "Calculating..." : "e.g. 200"}
              className={cn(
                "w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all",
                isCalculating && "opacity-70"
              )}
              value={formData.kilometers}
              onChange={(e) => setFormData({...formData, kilometers: e.target.value})}
              readOnly={isCalculating}
            />
          </div>
          {formData.kilometers && (
            <div className="mt-2 p-3 bg-brand-orange/5 rounded-xl border border-brand-orange/20">
              <p className="text-xs font-bold text-brand-orange uppercase tracking-wider">Final Rate (Estimated)</p>
              <p className="text-xl font-bold text-brand-dark">₹{calculateTotal()}</p>
              <div className="mt-2 pt-2 border-t border-brand-orange/10">
                <p className="text-[10px] text-slate-600 font-medium">
                  {formData.tripType === 'One Way' ? (
                    <>Distance: {formData.kilometers}km x 2 (Return) = {parseFloat(formData.kilometers) * 2}km</>
                  ) : (
                    <>Distance: {formData.kilometers}km</>
                  )}
                </p>
                <p className="text-[10px] text-red-600 font-bold uppercase tracking-tight mt-1">
                  ⚠️ Toll, Parking & State Tax Extra
                </p>
              </div>
            </div>
          )}
        </div>

        <button 
          type="submit" 
          className="w-full bg-brand-orange text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-all shadow-lg shadow-brand-orange/30 flex items-center justify-center gap-2 mt-4"
        >
          Book via WhatsApp <ArrowRight size={20} />
        </button>
      </form>
    </div>
  );
};

const SupportChat = ({ isOperator = false }: { isOperator?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.on('chat_history', (history) => {
      setMessages(history);
    });

    socket.on('receive_message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.off('chat_history');
      socket.off('receive_message');
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const data = {
      text: message,
      sender: isOperator ? 'Operator' : 'Customer',
      senderId: socket.id
    };

    socket.emit('send_message', data);
    setMessage('');
  };

  if (isOperator) {
    return (
      <div className="flex flex-col h-[600px] bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-brand-dark text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-orange rounded-xl flex items-center justify-center">
              <MessageCircle size={20} />
            </div>
            <div>
              <h3 className="font-bold">Live Support Chat</h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Operator View</p>
            </div>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
          {messages.map((msg, idx) => (
            <div key={idx} className={cn(
              "flex flex-col max-w-[80%]",
              msg.sender === 'Operator' ? "ml-auto items-end" : "items-start"
            )}>
              <div className={cn(
                "px-4 py-2 rounded-2xl text-sm font-medium shadow-sm",
                msg.sender === 'Operator' ? "bg-brand-orange text-white rounded-tr-none" : "bg-white text-brand-dark border border-slate-100 rounded-tl-none"
              )}>
                {msg.text}
              </div>
              <span className="text-[9px] text-slate-400 mt-1 font-bold uppercase tracking-tighter">
                {msg.sender} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
              <MessageCircle size={48} className="mb-4" />
              <p className="text-sm font-bold uppercase tracking-widest">No messages yet</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-2">
          <input 
            type="text" 
            placeholder="Type your response..."
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all text-sm"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button className="w-12 h-12 bg-brand-dark text-white rounded-xl flex items-center justify-center hover:bg-brand-orange transition-all shadow-lg">
            <Send size={20} />
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col"
          >
            <div className="p-6 bg-brand-dark text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BhopalLogo size={32} />
                <div>
                  <h3 className="font-bold text-sm">Tathastu Support</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Online Now</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
              <div className="bg-white p-4 rounded-2xl border border-slate-100 text-center mb-6">
                <p className="text-xs text-slate-500 font-medium">Hello! How can we help you today with your taxi booking?</p>
              </div>
              {messages.map((msg, idx) => (
                <div key={idx} className={cn(
                  "flex flex-col max-w-[80%]",
                  msg.sender === 'Customer' ? "ml-auto items-end" : "items-start"
                )}>
                  <div className={cn(
                    "px-4 py-2 rounded-2xl text-sm font-medium shadow-sm",
                    msg.sender === 'Customer' ? "bg-brand-orange text-white rounded-tr-none" : "bg-white text-brand-dark border border-slate-100 rounded-tl-none"
                  )}>
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 font-bold uppercase tracking-tighter">
                    {msg.sender === 'Customer' ? 'You' : 'Operator'} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-2">
              <input 
                type="text" 
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all text-sm"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button className="w-12 h-12 bg-brand-dark text-white rounded-xl flex items-center justify-center hover:bg-brand-orange transition-all shadow-lg">
                <Send size={20} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-500 transform hover:scale-110",
          isOpen ? "bg-brand-dark rotate-90" : "bg-brand-orange"
        )}
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>
    </div>
  );
};


const DriverRegistrationForm = ({ onClose }: { onClose: () => void }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    vehicleNumber: '',
    vehicleModel: '',
    rcDocument: '',
    licenseDocument: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    socket.emit('submit_driver_application', formData);
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Application submitted successfully! Our team will review your documents.');
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-10 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all"
        >
          <X size={20} />
        </button>
        
        <div className="p-8 border-b border-slate-100">
          <h2 className="text-2xl font-bold text-brand-dark">Driver Registration</h2>
          <p className="text-slate-500 text-sm mt-1">Submit your details and documents for verification</p>
        </div>

        <div className="p-8 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Full Name</label>
              <input 
                type="text" 
                required
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/20 outline-none"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Phone Number</label>
              <input 
                type="tel" 
                required
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/20 outline-none"
                placeholder="Enter your mobile number"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Vehicle Number</label>
                <input 
                  type="text" 
                  required
                  value={formData.vehicleNumber}
                  onChange={e => setFormData({...formData, vehicleNumber: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/20 outline-none"
                  placeholder="e.g. MP04 AB 1234"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Vehicle Model</label>
                <input 
                  type="text" 
                  required
                  value={formData.vehicleModel}
                  onChange={e => setFormData({...formData, vehicleModel: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/20 outline-none"
                  placeholder="e.g. Swift Dzire"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="font-bold text-brand-dark mb-4">Document Upload</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Driving License (Image/PDF)</label>
                  <input 
                    type="file" 
                    accept="image/*,.pdf"
                    required
                    onChange={e => handleFileChange(e, 'licenseDocument')}
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-orange-50 file:text-brand-orange hover:file:bg-orange-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Vehicle RC (Image/PDF)</label>
                  <input 
                    type="file" 
                    accept="image/*,.pdf"
                    required
                    onChange={e => handleFileChange(e, 'rcDocument')}
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-orange-50 file:text-brand-orange hover:file:bg-orange-100"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full mt-6 bg-brand-dark text-white py-4 rounded-2xl font-bold hover:bg-brand-orange transition-all disabled:opacity-70"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const DriverDashboard = ({ bookings, onBack }: { bookings: any[], onBack: () => void }) => {
  const [driverName, setDriverName] = useState(() => localStorage.getItem('driver_name') || '');
  const [vehicleNumber, setVehicleNumber] = useState(() => localStorage.getItem('vehicle_number') || '');
  const [driverPhoto, setDriverPhoto] = useState(() => localStorage.getItem('driver_photo') || 'https://images.unsplash.com/photo-1591035897819-f4bdf739f446?auto=format&fit=crop&q=80&w=200&h=200');
  const [isLoggedIn, setIsLoggedIn] = useState(!!driverName);
  const [isRegistering, setIsRegistering] = useState(false);

  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const name = (e.target as any).name.value;
    const vNum = (e.target as any).vehicleNumber.value;
    if (name && vNum) {
      setDriverName(name);
      setVehicleNumber(vNum);
      localStorage.setItem('driver_name', name);
      localStorage.setItem('vehicle_number', vNum);
      setIsLoggedIn(true);
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const name = (e.target as any).name.value;
    const vNum = (e.target as any).vehicleNumber.value;
    const photo = (e.target as any).photo.value;
    if (name && vNum) {
      setDriverName(name);
      setVehicleNumber(vNum);
      if (photo) {
        setDriverPhoto(photo);
        localStorage.setItem('driver_photo', photo);
      }
      localStorage.setItem('driver_name', name);
      localStorage.setItem('vehicle_number', vNum);
      setIsEditingProfile(false);
    }
  };

  const updateStatus = (bookingId: string, status: string) => {
    socket.emit('update_booking_status', { 
      bookingId, 
      status, 
      driverName, 
      vehicleNumber, 
      driverPhoto 
    });
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    
    const activeBookings = bookings.filter(b => b.driverName === driverName && (b.status === 'Accepted' || b.status === 'Arrived' || b.status === 'Started'));
    
    if (activeBookings.length > 0) {
      if (navigator.geolocation) {
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            activeBookings.forEach(b => {
              socket.emit('driver_location_update', {
                bookingId: b.id,
                location: { latitude, longitude }
              });
            });
          },
          (error) => {
            console.error("Error watching position:", error);
          },
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );
        return () => navigator.geolocation.clearWatch(watchId);
      }
    }
  }, [bookings, driverName, isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl w-full max-w-md">
          <div className="text-center mb-8">
            <BhopalLogo size={64} className="mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-brand-dark">Driver Login</h2>
            <p className="text-slate-500">Enter details to start receiving rides</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              name="name"
              type="text" 
              placeholder="Your Full Name"
              required
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-orange/20 outline-none"
            />
            <input 
              name="vehicleNumber"
              type="text" 
              placeholder="Vehicle Number (e.g. MP04 AB 1234)"
              required
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-orange/20 outline-none"
            />
            <button className="w-full bg-brand-dark text-white py-4 rounded-2xl font-bold hover:bg-brand-orange transition-all">
              Login to Fleet
            </button>
          </form>

          <div className="mt-8 p-6 bg-orange-50 rounded-2xl border border-orange-100">
            <h4 className="font-bold text-brand-orange mb-3 flex items-center gap-2">
              <ShieldCheck size={18} /> Attach Your Taxi
            </h4>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              To attach your vehicle, the following original documents are required:
            </p>
            <ul className="space-y-2">
              {['Permit', 'RC (Registration Certificate)', 'Driving License', 'Pollution Certificate', 'Insurance Policy'].map((doc, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <div className="w-1.5 h-1.5 bg-brand-orange rounded-full" /> {doc}
                </li>
              ))}
            </ul>
            <button 
              onClick={() => setIsRegistering(true)}
              className="w-full mt-4 bg-white text-brand-orange border border-brand-orange py-3 rounded-xl font-bold hover:bg-orange-50 transition-all"
            >
              Register Now
            </button>
          </div>

          <button onClick={onBack} className="w-full mt-6 text-slate-400 font-bold hover:text-brand-dark">
            Back to Website
          </button>
        </div>
        {isRegistering && <DriverRegistrationForm onClose={() => setIsRegistering(false)} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Car size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-brand-dark">Driver App</h2>
              <p className="text-slate-500 text-sm">Welcome back, <span className="font-bold text-brand-orange">{driverName}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsEditingProfile(!isEditingProfile)} className="bg-white border border-slate-200 px-4 py-3 rounded-2xl font-bold hover:bg-slate-50 flex items-center gap-2">
              <User size={18} /> Profile
            </button>
            <button onClick={onBack} className="bg-white border border-slate-200 px-6 py-3 rounded-2xl font-bold hover:bg-slate-50">
              Exit
            </button>
          </div>
        </div>

        {isEditingProfile && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 mb-8"
          >
            <h3 className="text-xl font-bold text-brand-dark mb-4">Edit Profile</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <img src={driverPhoto} alt="Profile" className="w-16 h-16 rounded-full object-cover border border-slate-200" />
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Photo URL</label>
                  <input 
                    name="photo"
                    type="url" 
                    defaultValue={driverPhoto}
                    placeholder="Image URL"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/20 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Full Name</label>
                  <input 
                    name="name"
                    type="text" 
                    defaultValue={driverName}
                    required
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Vehicle Number</label>
                  <input 
                    name="vehicleNumber"
                    type="text" 
                    defaultValue={vehicleNumber}
                    required
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/20 outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsEditingProfile(false)} className="px-6 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" className="bg-brand-dark text-white px-6 py-2 rounded-xl font-bold hover:bg-brand-orange transition-all">
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-brand-dark">Available Rides</h3>
          {bookings.filter(b => b.status === 'Pending' || b.driverName === driverName).map((b, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Booking ID: {b.id}</span>
                  <h4 className="text-lg font-bold text-brand-dark">{b.carName}</h4>
                </div>
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                  b.status === 'Pending' ? "bg-orange-100 text-brand-orange" : 
                  b.status === 'Completed' ? "bg-slate-100 text-slate-500" : "bg-green-100 text-green-600"
                )}>
                  {b.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Pickup</p>
                    <p className="text-sm font-bold">{b.pickup}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                    <MapPin size={16} className="text-red-500" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Drop</p>
                    <p className="text-sm font-bold">{b.drop}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                {b.status === 'Pending' && (
                  <button 
                    onClick={() => updateStatus(b.id, 'Accepted')}
                    className="flex-1 bg-brand-dark text-white py-3 rounded-xl font-bold hover:bg-brand-orange transition-all"
                  >
                    Accept Ride
                  </button>
                )}
                {b.status === 'Accepted' && b.driverName === driverName && (
                  <div className="flex-1 flex flex-col gap-2">
                    {b.location && (
                      <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${b.location.latitude},${b.location.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                      >
                        <Navigation size={18} /> Navigate to Customer
                      </a>
                    )}
                    <button 
                      onClick={() => updateStatus(b.id, 'Arrived')}
                      className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
                    >
                      Mark as Arrived
                    </button>
                  </div>
                )}
                {b.status === 'Arrived' && b.driverName === driverName && (
                  <button 
                    onClick={() => updateStatus(b.id, 'Started')}
                    className="flex-1 bg-brand-orange text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition-all"
                  >
                    Start Trip
                  </button>
                )}
                {b.status === 'Started' && b.driverName === driverName && (
                  <button 
                    onClick={() => updateStatus(b.id, 'Completed')}
                    className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-all"
                  >
                    Complete Trip
                  </button>
                )}
              </div>
            </motion.div>
          ))}
          {bookings.filter(b => b.status === 'Pending' || b.driverName === driverName).length === 0 && (
            <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
              <Car size={48} className="mx-auto mb-4 text-slate-200" />
              <p className="text-slate-400">No active rides available right now.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const OperatorDashboard = ({ bookings, onBack }: { bookings: any[], onBack: () => void }) => {
  const [tab, setTab] = useState<'bookings' | 'chat' | 'applications'>('bookings');
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Applications state
  const [applications, setApplications] = useState<any[]>([]);

  const cancelBooking = (bookingId: string) => {
    socket.emit('cancel_booking', { bookingId });
    setCancelBookingId(null);
  };

  useEffect(() => {
    socket.on('driver_applications_history', (history) => {
      setApplications(history);
    });
    socket.on('new_driver_application', (app) => {
      setApplications(prev => [app, ...prev]);
    });
    socket.on('application_status_updated', (updatedApp) => {
      setApplications(prev => prev.map(a => a.id === updatedApp.id ? updatedApp : a));
    });

    return () => {
      socket.off('driver_applications_history');
      socket.off('new_driver_application');
      socket.off('application_status_updated');
    };
  }, []);

  const totalRevenue = bookings.reduce((acc, b) => acc + (parseFloat(b.total) || 0), 0);
  
  const filteredBookings = bookings.filter(b => {
    // Search query (pickup or drop)
    const matchesSearch = 
      !searchQuery || 
      (b.pickup && b.pickup.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (b.drop && b.drop.toLowerCase().includes(searchQuery.toLowerCase()));
      
    // Status filter
    const status = b.status || 'Pending';
    const matchesStatus = filterStatus === 'All' || status === filterStatus;
    
    // Date filter
    let matchesDate = true;
    if (filterStartDate || filterEndDate) {
      const bookingDate = new Date(b.date);
      if (filterStartDate) {
        matchesDate = matchesDate && bookingDate >= new Date(filterStartDate);
      }
      if (filterEndDate) {
        const endDate = new Date(filterEndDate);
        endDate.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && bookingDate <= endDate;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      {cancelBookingId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full">
            <h3 className="text-xl font-bold text-brand-dark mb-4">Cancel Booking?</h3>
            <p className="text-slate-500 mb-8">Are you sure you want to cancel this booking? This action cannot be undone.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setCancelBookingId(null)}
                className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200"
              >
                No, Keep It
              </button>
              <button 
                onClick={() => cancelBooking(cancelBookingId)}
                className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-orange rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-orange/20">
              <LayoutDashboard size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-brand-dark">Operator Dashboard</h2>
              <p className="text-slate-500 text-sm">Manage your taxi bookings and fleet performance</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-white p-1 rounded-2xl border border-slate-200 flex">
              <button 
                onClick={() => setTab('bookings')}
                className={cn(
                  "px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                  tab === 'bookings' ? "bg-brand-dark text-white shadow-lg" : "text-slate-400 hover:text-brand-dark"
                )}
              >
                <History size={16} /> Ride History
              </button>
              <button 
                onClick={() => setTab('chat')}
                className={cn(
                  "px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                  tab === 'chat' ? "bg-brand-dark text-white shadow-lg" : "text-slate-400 hover:text-brand-dark"
                )}
              >
                <MessageCircle size={16} /> Support Chat
              </button>
              <button 
                onClick={() => setTab('applications')}
                className={cn(
                  "px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                  tab === 'applications' ? "bg-brand-dark text-white shadow-lg" : "text-slate-400 hover:text-brand-dark"
                )}
              >
                <Users size={16} /> Applications
              </button>
            </div>
            <button 
              onClick={onBack}
              className="bg-white text-brand-dark border border-slate-200 px-6 py-3 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <ArrowRight className="rotate-180" size={20} /> Exit
            </button>
          </div>
        </div>

        {tab === 'bookings' ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <History size={20} />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Bookings</p>
                <p className="text-3xl font-bold text-brand-dark">{bookings.length}</p>
              </div>
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp size={20} />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Est. Revenue</p>
                <p className="text-3xl font-bold text-brand-dark">₹{totalRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                <div className="w-10 h-10 bg-orange-50 text-brand-orange rounded-xl flex items-center justify-center mb-4">
                  <Car size={20} />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Active Fleet</p>
                <p className="text-3xl font-bold text-brand-dark">4 Vehicles</p>
              </div>
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <Users size={20} />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Happy Clients</p>
                <p className="text-3xl font-bold text-brand-dark">{bookings.length + 120}</p>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <h3 className="text-xl font-bold text-brand-dark">Ride History</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Search locations..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/50 w-full sm:w-48"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                    <Filter className="text-slate-400" size={16} />
                    <select 
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="bg-transparent text-sm font-medium text-brand-dark focus:outline-none"
                    >
                      <option value="All">All Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Arrived">Arrived</option>
                      <option value="Started">Started</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                    <input 
                      type="date" 
                      value={filterStartDate}
                      onChange={(e) => setFilterStartDate(e.target.value)}
                      className="bg-transparent text-sm font-medium text-brand-dark focus:outline-none"
                    />
                    <span className="text-slate-400">-</span>
                    <input 
                      type="date" 
                      value={filterEndDate}
                      onChange={(e) => setFilterEndDate(e.target.value)}
                      className="bg-transparent text-sm font-medium text-brand-dark focus:outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-8 py-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Booking ID</th>
                      <th className="px-8 py-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Date & Time</th>
                      <th className="px-8 py-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Route Details</th>
                      <th className="px-8 py-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Vehicle</th>
                      <th className="px-8 py-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Status</th>
                      <th className="px-8 py-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Est. Amount</th>
                      <th className="px-8 py-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredBookings.map((b, i) => (
                      <tr key={i} className="hover:bg-slate-50/30 transition-colors group">
                        <td className="px-8 py-6">
                          <span className="font-mono text-xs font-bold text-brand-orange bg-orange-50 px-2 py-1 rounded-md">{b.id}</span>
                        </td>
                        <td className="px-8 py-6">
                          <p className="font-bold text-sm text-brand-dark">{b.date}</p>
                          <p className="text-xs text-slate-400 font-medium">{b.time}</p>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            <p className="text-sm font-bold text-brand-dark">{b.pickup}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            <p className="text-xs text-slate-400 font-medium">{b.drop}</p>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-brand-dark">{b.carType || b.carName}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{b.tripType || 'Direct'}</p>
                        </td>
                        <td className="px-8 py-6">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                            (b.status || 'Pending') === 'Pending' ? "bg-orange-50 text-brand-orange" : 
                            (b.status || 'Pending') === 'Completed' ? "bg-slate-100 text-slate-500" : "bg-green-50 text-green-600"
                          )}>
                            {b.status || 'Pending'}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-lg font-bold text-brand-dark">₹{b.total || 'TBD'}</p>
                          <p className="text-[10px] text-slate-400 font-medium italic">Excl. Toll/Tax</p>
                        </td>
                        <td className="px-8 py-6">
                          {b.status !== 'Completed' && b.status !== 'Rejected' && b.status !== 'Cancelled' && (
                            <button 
                              onClick={() => setCancelBookingId(b.id)}
                              className="text-red-500 font-bold text-xs hover:text-red-700"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredBookings.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-8 py-20 text-center">
                          <div className="max-w-xs mx-auto">
                            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Search size={32} />
                            </div>
                            <p className="text-slate-400 font-medium">No bookings found matching your filters.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : tab === 'chat' ? (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <SupportChat isOperator={true} />
            </div>
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
                <h4 className="text-lg font-bold text-brand-dark mb-4">Support Guidelines</h4>
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <div className="w-6 h-6 bg-green-50 text-green-600 rounded-full flex items-center justify-center shrink-0">
                      <ShieldCheck size={14} />
                    </div>
                    <p className="text-xs text-slate-500">Be professional and polite with all customers.</p>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-6 h-6 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                      <Clock size={14} />
                    </div>
                    <p className="text-xs text-slate-500">Try to respond within 2-3 minutes for better customer satisfaction.</p>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-6 h-6 bg-orange-50 text-brand-orange rounded-full flex items-center justify-center shrink-0">
                      <Info size={14} />
                    </div>
                    <p className="text-xs text-slate-500">Confirm pickup locations and vehicle availability clearly.</p>
                  </li>
                </ul>
              </div>
              <div className="bg-brand-orange p-8 rounded-[2rem] shadow-xl text-white">
                <h4 className="text-lg font-bold mb-2">Need Help?</h4>
                <p className="text-sm opacity-80 mb-6">If you encounter any technical issues with the dashboard, contact support.</p>
                <a href="tel:+919754364899" className="block w-full bg-white text-brand-orange py-3 rounded-xl font-bold text-center">
                  Call Tech Support
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-brand-dark">Driver Applications</h3>
              <div className="px-4 py-2 bg-orange-50 text-brand-orange rounded-full text-sm font-bold">
                {applications.filter(a => a.status === 'Pending').length} Pending
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Driver</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Vehicle</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Documents</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <p className="font-bold text-sm text-brand-dark">{app.fullName}</p>
                        <p className="text-xs text-slate-400 font-medium">{app.phone}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-bold text-sm text-brand-dark">{app.vehicleNumber}</p>
                        <p className="text-xs text-slate-400 font-medium">{app.vehicleModel}</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex gap-2">
                          <a href={app.licenseDocument} target="_blank" rel="noreferrer" className="text-xs font-bold text-brand-orange hover:underline">View License</a>
                          <span className="text-slate-300">|</span>
                          <a href={app.rcDocument} target="_blank" rel="noreferrer" className="text-xs font-bold text-brand-orange hover:underline">View RC</a>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                          app.status === 'Pending' ? "bg-orange-50 text-brand-orange" : 
                          app.status === 'Approved' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                        )}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        {app.status === 'Pending' && (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => socket.emit('update_application_status', { id: app.id, status: 'Approved' })}
                              className="px-4 py-2 bg-green-50 text-green-600 rounded-xl text-xs font-bold hover:bg-green-100 transition-colors"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => socket.emit('update_application_status', { id: app.id, status: 'Rejected' })}
                              className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {applications.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <p className="text-slate-400 font-medium">No driver applications found.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [selectedCar, setSelectedCar] = useState<any>(null);
  const [bookingConfirmation, setBookingConfirmation] = useState<any>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [view, setView] = useState<'customer' | 'operator' | 'driver'>('customer');
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    socket.on('booking_history', (history) => {
      setBookings(history);
    });
    socket.on('new_booking', (booking) => {
      setBookings(prev => [booking, ...prev]);
    });
    socket.on('booking_status_updated', (updatedBooking) => {
      setBookings(prev => prev.map(b => b.id === updatedBooking.id ? updatedBooking : b));
      // Update confirmation modal details if it's the current booking
      setBookingConfirmation((prev: any) => 
        prev && prev.id === updatedBooking.id ? { ...prev, ...updatedBooking } : prev
      );
    });
    socket.on('driver_location_updated', (data) => {
      setBookings(prev => prev.map(b => b.id === data.bookingId ? { ...b, driverLocation: data.location } : b));
      setBookingConfirmation((prev: any) => 
        prev && prev.id === data.bookingId ? { ...prev, driverLocation: data.location } : prev
      );
    });
    return () => {
      socket.off('booking_history');
      socket.off('new_booking');
      socket.off('booking_status_updated');
      socket.off('driver_location_updated');
    };
  }, []);

  const handleBookingComplete = (details: any) => {
    socket.emit('create_booking', details);
    setBookingConfirmation(details);
    
    // Send SMS confirmation
    if (details.phone) {
      fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: details.phone.startsWith('+') ? details.phone : `+91${details.phone}`,
          message: `Tathastu Travels: Your booking ${details.id} is confirmed. Pickup: ${details.pickup}, Drop: ${details.drop}, Date: ${details.date}, Time: ${details.time}. Thank you!`
        })
      }).catch(err => console.error('Failed to send SMS:', err));
    }
    // Send booking details via email
    const subject = encodeURIComponent(`New Taxi Booking: ${details.id}`);
    const body = encodeURIComponent(`
New Booking Details:
-------------------
Booking ID: ${details.id}
Pickup: ${details.pickup}
Drop: ${details.drop}
Date: ${details.date}
Time: ${details.time}
Car Type: ${details.carType || details.carName}
Trip Type: ${details.tripType || 'Direct'}
Estimated Total: ₹${details.total || 'TBD'}
    `);
    window.location.href = `mailto:anilmaran4302@gmail.com?subject=${subject}&body=${body}`;
  };

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      console.log('PWA was installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    setDeferredPrompt(null);
  };

  const fleet = [
    {
      name: "Maruti Alto",
      type: "Hatchback",
      capacity: "4+1 Seater",
      price: "₹9/km",
      localPrice: "₹1600",
      localLimit: "8h/80km",
      pickupDrop: "Separate Charges",
      tollParking: "Extra",
      status: "Available",
      bookedDates: ["2026-04-05"],
      img: "https://images.unsplash.com/photo-1621348160394-211bc0a5a604?auto=format&fit=crop&q=80&w=800&h=600",
      location: { latitude: 23.2599, longitude: 77.4126 },
      details: {
        fuel: "Petrol/CNG",
        mileage: "24-26 km/l",
        transmission: "Manual",
        features: ["Air Conditioning", "Compact Size", "Fuel Efficient", "USB Charger"],
        amenities: ["Charging Ports", "Music System"]
      }
    },
    {
      name: "Maruti S-Presso",
      type: "Hatchback",
      capacity: "4+1 Seater",
      price: "₹10/km",
      localPrice: "₹1800",
      localLimit: "8h/80km",
      pickupDrop: "Separate Charges",
      tollParking: "Extra",
      status: "Available",
      bookedDates: ["2026-04-02"],
      img: "https://images.unsplash.com/photo-1632245889029-e406fbdd34ae?auto=format&fit=crop&q=80&w=800&h=600",
      location: { latitude: 23.2620, longitude: 77.4100 },
      details: {
        fuel: "Petrol/CNG",
        mileage: "21-23 km/l",
        transmission: "Manual",
        features: ["Air Conditioning", "High Ground Clearance", "Music System", "Power Windows"],
        amenities: ["Charging Ports", "Entertainment System"]
      }
    },
    {
      name: "Maruti Swift Dzire",
      type: "Sedan",
      capacity: "4+1 Seater",
      price: "₹11/km",
      localPrice: "₹2000",
      localLimit: "8h/80km",
      pickupDrop: "Separate Charges",
      tollParking: "Extra",
      status: "Available",
      bookedDates: ["2026-03-31", "2026-04-05", "2026-04-06"],
      img: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=800&h=600",
      location: { latitude: 23.2550, longitude: 77.4150 },
      details: {
        fuel: "Diesel/CNG",
        mileage: "22-24 km/l",
        transmission: "Manual",
        features: ["Air Conditioning", "Music System", "Spacious Boot", "USB Charger"],
        amenities: ["Wi-Fi", "Charging Ports", "Entertainment System"]
      }
    },
    {
      name: "Maruti Ertiga",
      type: "MUV",
      capacity: "6+1 Seater",
      price: "₹13/km",
      localPrice: "₹2500",
      localLimit: "8h/80km",
      pickupDrop: "Separate Charges",
      tollParking: "Extra",
      status: "Available",
      bookedDates: ["2026-03-30", "2026-03-31", "2026-04-01", "2026-04-10"],
      img: "https://images.unsplash.com/photo-1616455579100-2ceaa4eb2d37?auto=format&fit=crop&q=80&w=800&h=600",
      location: { latitude: 23.2500, longitude: 77.4200 },
      details: {
        fuel: "Diesel/CNG",
        mileage: "18-20 km/l",
        transmission: "Manual",
        features: ["Dual AC", "Music System", "Foldable Seats", "Power Windows"],
        amenities: ["Wi-Fi", "Charging Ports", "Entertainment System"]
      }
    }
  ];

  return (
    <div className="min-h-screen selection:bg-brand-orange selection:text-white" id="home">
      {view === 'operator' ? (
        <OperatorDashboard bookings={bookings} onBack={() => setView('customer')} />
      ) : view === 'driver' ? (
        <DriverDashboard bookings={bookings} onBack={() => setView('customer')} />
      ) : (
        <>
          <Navbar deferredPrompt={deferredPrompt} onInstall={handleInstallClick} setView={setView} />
          <SupportChat />
          <VehicleModal 
            car={selectedCar} 
            isOpen={!!selectedCar} 
            onClose={() => setSelectedCar(null)} 
            onBookingComplete={handleBookingComplete}
          />
          <ConfirmationModal 
            isOpen={!!bookingConfirmation}
            onClose={() => setBookingConfirmation(null)}
            details={bookingConfirmation}
          />

          {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-brand-orange rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 text-brand-orange text-sm font-bold mb-6">
                <Star size={16} fill="currentColor" /> All India Taxi Service
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] mb-6 text-brand-dark">
                Bhopal se <span className="text-brand-orange">All India</span> ke liye
              </h1>
              <p className="text-xl text-slate-600 mb-8 max-w-lg leading-relaxed">
                All India service taxi Bhopal se all India ke liye, mostly airport drops and pickups. Book your outstation trip today!
              </p>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                  <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                    <Plane size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Airport Drops & Pickups</p>
                    <p className="text-xs text-slate-500">24/7 Available</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">All India Service</p>
                    <p className="text-xs text-slate-500">From Bhopal to Anywhere</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <BookingForm onBookingComplete={handleBookingComplete} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-white" id="services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-bold text-brand-orange uppercase tracking-widest mb-4">Our Services</h2>
            <h3 className="text-4xl font-bold text-brand-dark">Premium Travel Solutions for Every Need</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Airport Drops & Pickups",
                desc: "Hassle-free pickups and drops to Bhopal, Indore, and Nagpur airports. Punctuality guaranteed for all your flights.",
                icon: <Plane className="text-brand-orange" size={32} />,
                bg: "bg-orange-50"
              },
              {
                title: "All India Outstation",
                desc: "Comfortable long-distance travel from Bhopal to any city in India. One-way or round-trip, we cover it all.",
                icon: <MapPin className="text-blue-600" size={32} />,
                bg: "bg-blue-50"
              },
              {
                title: "Local Sightseeing",
                desc: "Explore Bhopal's beauty with our local packages. Visit Upper Lake, Sanchi, and Bhimbetka with expert drivers.",
                icon: <Car className="text-green-600" size={32} />,
                bg: "bg-green-50"
              }
            ].map((service, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -10 }}
                className="p-8 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
              >
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-6", service.bg)}>
                  {service.icon}
                </div>
                <h4 className="text-xl font-bold mb-4">{service.title}</h4>
                <p className="text-slate-600 leading-relaxed">{service.desc}</p>
                <button className="mt-6 text-brand-orange font-bold flex items-center gap-2 group">
                  Learn More <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Fleet Section */}
      <section className="py-24 bg-slate-50" id="fleet">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-sm font-bold text-brand-orange uppercase tracking-widest mb-4">Our Fleet</h2>
              <h3 className="text-4xl font-bold text-brand-dark">Choose the Perfect Ride for Your Journey</h3>
            </div>
            <button className="bg-white border border-slate-200 px-6 py-3 rounded-xl font-bold hover:bg-slate-100 transition-colors">
              View All Vehicles
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {fleet.map((car, idx) => (
              <div key={idx} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 group flex flex-col">
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={car.img} 
                    alt={car.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <div className="bg-brand-dark/80 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs font-bold uppercase">
                      {car.type}
                    </div>
                    <div className={cn(
                      "px-3 py-1 rounded-lg text-[10px] font-bold uppercase backdrop-blur-md",
                      car.status === 'Available' ? "bg-green-500/80 text-white" : "bg-red-500/80 text-white"
                    )}>
                      {car.status}
                    </div>
                  </div>
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <h4 className="text-xl font-bold mb-2">{car.name}</h4>
                  <div className="flex items-center gap-4 text-slate-500 text-sm mb-6">
                    <span className="flex items-center gap-1"><Car size={14} /> AC</span>
                    <span className="flex items-center gap-1"><Star size={14} /> {car.capacity}</span>
                  </div>
                  
                  <button 
                    onClick={() => setSelectedCar(car)}
                    className="w-full py-3 mb-6 border border-slate-100 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-brand-orange transition-all flex items-center justify-center gap-2"
                  >
                    <Info size={16} /> View Details
                  </button>

                  <div className="flex flex-col gap-1 pt-6 border-t border-slate-100 mt-auto">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Outstation</p>
                        <p className="text-lg font-bold text-brand-orange">{car.price}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase text-right">Local (8h/80km)</p>
                        <p className="text-lg font-bold text-brand-dark text-right">{car.localPrice}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 mt-2">
                      <p className="text-[10px] text-slate-400 font-medium italic">* Toll/Parking Extra | Pickup-Drop (Min. 30km for &lt;10km)</p>
                      <p className="text-[10px] text-slate-400 font-medium italic">* Outstation Drop: Return km charges apply</p>
                      <button 
                        onClick={() => {
                          const bookingId = `TT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
                          const message = `Hello Tathastu Travels, I want to book ${car.name}.\nBooking ID: ${bookingId}`;
                          window.open(`https://wa.me/919754364899?text=${encodeURIComponent(message)}`, '_blank');
                          setBookingConfirmation({ carName: car.name, id: bookingId });
                        }}
                        className="bg-brand-dark text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-brand-orange transition-colors mt-1"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us & Owner Profile */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden bg-slate-200 shadow-2xl">
                {/* Using a high-quality placeholder that matches the user's uploaded portrait vibe */}
                <img 
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=1000&h=1000" 
                  alt="Owner / Professional Driver" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-8 -right-8 bg-brand-orange text-white p-8 rounded-3xl shadow-2xl hidden md:block">
                <p className="text-4xl font-bold mb-1">10+</p>
                <p className="text-sm font-medium opacity-80">Years of Trust</p>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-bold text-brand-orange uppercase tracking-widest mb-4">Meet Your Travel Partner</h2>
              <h3 className="text-4xl font-bold text-brand-dark mb-8 leading-tight">All India Service Taxi Bhopal Se All India Ke Liye</h3>
              
              <div className="space-y-8">
                {[
                  {
                    title: "Mostly Airport Transfers",
                    desc: "We specialize in Raja Bhoj Airport (Bhopal) pickups and drops. Always on time, every time.",
                    icon: <Plane className="text-brand-orange" />
                  },
                  {
                    title: "All India Outstation",
                    desc: "Planning a trip outside Bhopal? We provide comfortable cabs for all over India at the best rates.",
                    icon: <MapPin className="text-blue-600" />
                  },
                  {
                    title: "Professional & Safe",
                    desc: "Experienced drivers, clean cars, and 24/7 support to ensure your journey is smooth and safe.",
                    icon: <ShieldCheck className="text-green-600" />
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold mb-2">{item.title}</h4>
                      <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-[3rem] p-8 md:p-16 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            
            <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-bold mb-6">
                  <Car size={16} /> Business Opportunity
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-brand-dark mb-6 leading-tight">
                  अपनी कार हमारे साथ <span className="text-brand-orange">अटैच करें</span>
                </h2>
                <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                  क्या आपके पास अपनी कार है? तथास्तु ट्रेवल्स के साथ जुड़ें और अपनी कमाई बढ़ाएं। हम भोपाल और आस-पास के क्षेत्रों से गाड़ियां अटैच कर रहे हैं।
                </p>
                
                <ul className="space-y-4 mb-8">
                  {[
                    "नियमित बुकिंग और अच्छी कमाई",
                    "समय पर भुगतान की गारंटी",
                    "पारदर्शी और ईमानदार सिस्टम",
                    "24/7 सपोर्ट और सहायता"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                      <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                        <ChevronRight size={14} strokeWidth={3} />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-8 flex items-start gap-3">
                  <ShieldCheck className="text-red-600 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-red-800 font-bold mb-1">Strict Policy / सख्त नियम</h4>
                    <p className="text-sm text-red-700 font-medium">
                      बिना वैध दस्तावेजों (RC, Insurance, Permit, Fitness) के कोई भी गाड़ी अटैच नहीं की जाएगी।<br/>
                      <span className="text-xs opacity-80">Vehicles will NOT be attached without complete and valid papers.</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <a 
                    href="https://wa.me/919754364899?text=Hello, I want to attach my car with Tathastu Travels." 
                    className="bg-brand-orange text-white px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-orange-600 transition-all shadow-lg shadow-brand-orange/30"
                  >
                    <MessageCircle size={24} /> अभी संपर्क करें
                  </a>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                  <img 
                    src="https://picsum.photos/seed/partnership/800/600" 
                    alt="Partner with us" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute -top-6 -left-6 bg-white p-6 rounded-3xl shadow-xl border border-slate-50 hidden md:block">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Contact for Attachment</p>
                  <p className="text-2xl font-bold text-brand-dark">97543 64899</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* App Download Section */}
      <section className="py-24 bg-white overflow-hidden" id="download">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-brand-dark rounded-[3rem] p-8 md:p-16 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
            
            <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-brand-orange text-sm font-bold mb-6">
                  <Smartphone size={16} /> Mobile App
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  Book Your Ride <span className="text-brand-orange">Faster</span> with Our App
                </h2>
                <p className="text-xl text-slate-400 mb-10 leading-relaxed">
                  Install Tathastu Travels directly from your browser for a seamless booking experience, real-time tracking, and exclusive app-only discounts.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={handleInstallClick}
                    className={cn(
                      "bg-white text-brand-dark px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg",
                      deferredPrompt ? "hover:bg-slate-100 animate-pulse" : "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Smartphone size={24} /> {deferredPrompt ? "Install App Now" : "App Ready to Install"}
                  </button>
                  <div className="flex gap-4">
                    <button className="bg-white/10 text-white p-4 rounded-2xl hover:bg-white/20 transition-all">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="h-8" />
                    </button>
                    <button className="bg-white/10 text-white p-4 rounded-2xl hover:bg-white/20 transition-all">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="h-8" />
                    </button>
                  </div>
                </div>

                <div className="mt-12 flex items-center gap-6">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-brand-dark overflow-hidden bg-slate-700">
                        <img src={`https://i.pravatar.cc/100?u=${i}`} alt="User" />
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-slate-400 font-medium">Joined by <span className="text-white font-bold">2,000+</span> happy travelers</p>
                </div>
              </div>

              <div className="relative flex justify-center">
                <motion.div 
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className="relative z-10 w-64 md:w-80"
                >
                  <div className="bg-slate-800 rounded-[3rem] p-4 border-8 border-slate-900 shadow-2xl">
                    <div className="bg-white rounded-[2rem] overflow-hidden aspect-[9/19] relative">
                      <div className="absolute inset-0 bg-slate-50 p-4">
                        <div className="w-full h-8 bg-brand-orange rounded-lg mb-4" />
                        <div className="space-y-3">
                          <div className="w-full h-24 bg-white rounded-xl shadow-sm" />
                          <div className="w-full h-24 bg-white rounded-xl shadow-sm" />
                          <div className="w-full h-24 bg-white rounded-xl shadow-sm" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-brand-orange/5 rounded-full blur-3xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-slate-50" id="testimonials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-bold text-brand-orange uppercase tracking-widest mb-4">Testimonials</h2>
            <h3 className="text-4xl font-bold text-brand-dark mb-4">What Our Travelers Say</h3>
            <p className="text-slate-600">Real stories from people who chose Tathastu Travels for their journeys across India.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Rahul Sharma",
                role: "Business Traveler",
                content: "Best taxi service in Bhopal. The driver was professional and the car was spotless. Highly recommended for airport transfers.",
                rating: 5
              },
              {
                name: "Priya Patel",
                role: "Family Trip",
                content: "We booked an Ertiga for a trip to Ujjain. Very comfortable journey and the driver knew all the best routes. Great experience!",
                rating: 5
              },
              {
                name: "Amit Verma",
                role: "Outstation Trip",
                content: "Booked a taxi from Bhopal to Indore. The rates were very competitive and the service was top-notch. Will book again.",
                rating: 5
              }
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className="fill-brand-orange text-brand-orange" />
                  ))}
                </div>
                <p className="text-slate-600 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange font-bold">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-brand-dark">{testimonial.name}</p>
                    <p className="text-sm text-slate-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white" id="faq">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-bold text-brand-orange uppercase tracking-widest mb-4">FAQ</h2>
            <h3 className="text-4xl font-bold text-brand-dark mb-4">Frequently Asked Questions</h3>
            <p className="text-slate-600">Everything you need to know about our taxi services in Bhopal and beyond.</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                q: "How do I book a taxi with Tathastu Travels?",
                a: "You can book easily through our website form which sends a direct message to our WhatsApp, or you can call us directly at +91 97543 64899."
              },
              {
                q: "Do you provide one-way outstation drops?",
                a: "Yes, we provide both one-way drops and round-trip services for outstation journeys from Bhopal to any city in India."
              },
              {
                q: "Is airport pickup available at Raja Bhoj Airport?",
                a: "Absolutely! We provide 24/7 airport pickup and drop services. Our drivers will be waiting for you at the arrival gate."
              },
              {
                q: "What are your vehicle options?",
                a: "We have a wide range of vehicles including Hatchbacks (Alto, S-Presso), Sedans (Swift Dzire), and MUVs (Ertiga)."
              }
            ].map((item, idx) => (
              <div key={idx} className="p-6 rounded-2xl border border-slate-100 bg-slate-50">
                <h4 className="text-lg font-bold text-brand-dark mb-2">{item.q}</h4>
                <p className="text-slate-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-24 bg-slate-50" id="map">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-bold text-brand-orange uppercase tracking-widest mb-4">Find Us</h2>
            <h3 className="text-4xl font-bold text-brand-dark mb-4">Tathastu Travels on Map</h3>
            <p className="text-slate-600 mb-8">Visit our office at Raja Bhoj Airport, Gandhi Nagar, Bhopal. We are available 24/7 for your travel needs.</p>
            <a 
              href="https://www.google.com/maps/dir/?api=1&destination=Tathastu+Travels+Bhopal+Raja+Bhoj+Airport" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-brand-dark text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-orange transition-all shadow-lg"
            >
              <MapPin size={20} /> Get Directions
            </a>
          </div>
          
          <div className="bg-white p-4 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="rounded-[2rem] overflow-hidden h-[500px] relative">
              <iframe 
                src="https://www.google.com/maps?q=Tathastu+Travels+Bhopal+Raja+Bhoj+Airport&output=embed" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Tathastu Travels Location"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-brand-dark text-white overflow-hidden relative" id="contact">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-orange/10 skew-x-12 translate-x-1/2" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Start Your Journey?</h2>
              <p className="text-xl text-slate-400">Call us now for the best rates and premium service from Bhopal to anywhere in India.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <a 
                href="tel:+919754364899" 
                className="bg-white text-brand-dark px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-slate-100 transition-all"
              >
                <Phone size={24} /> +91 97543 64899
              </a>
              <a 
                href="https://wa.me/919754364899" 
                className="bg-green-500 text-white px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-green-600 transition-all shadow-lg shadow-green-500/30"
              >
                <MessageCircle size={24} /> WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <BhopalLogo size={40} />
                <span className="text-2xl font-bold tracking-tight text-brand-dark">Tathastu <span className="text-brand-orange">Travels</span></span>
              </div>
              <p className="text-slate-500 mb-8 max-w-sm">
                All India service taxi Bhopal se all India ke liye. We specialize in airport transfers, mostly airport drops and pickups.
              </p>
              <div className="flex gap-4">
                <a href="https://www.google.com/search?q=Tathastu+Travels+Bhopal" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-brand-dark hover:bg-brand-orange hover:text-white transition-all">
                  <MapPin size={20} />
                </a>
                <a href="https://wa.me/919754364899" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-brand-dark hover:bg-green-500 hover:text-white transition-all">
                  <MessageCircle size={20} />
                </a>
                <a href="tel:+919754364899" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-brand-dark hover:bg-blue-500 hover:text-white transition-all">
                  <Phone size={20} />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-brand-dark mb-6">Quick Links</h4>
              <ul className="space-y-4 text-slate-500">
                <li><a href="#home" className="hover:text-brand-orange transition-colors">Home</a></li>
                <li><a href="#fleet" className="hover:text-brand-orange transition-colors">Our Fleet</a></li>
                <li><a href="#testimonials" className="hover:text-brand-orange transition-colors">Reviews</a></li>
                <li><a href="#faq" className="hover:text-brand-orange transition-colors">FAQ</a></li>
                <li><a href="#map" className="hover:text-brand-orange transition-colors">Find Us</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-brand-dark mb-6">Contact Us</h4>
              <ul className="space-y-4 text-slate-500">
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="text-brand-orange mt-1 shrink-0" />
                  <span>Raja Bhoj Airport, Gandhi Nagar, Bhopal, MP 462036</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-brand-orange shrink-0" />
                  <span>+91 97543 64899</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={18} className="text-brand-orange shrink-0" />
                  <a href="mailto:anilmaran4302@gmail.com" className="hover:text-brand-orange transition-colors">
                    anilmaran4302@gmail.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6">
              <p className="text-sm text-slate-400">© 2026 Tathastu Travels. All rights reserved.</p>
              <button 
                onClick={() => setView('operator')}
                className="text-xs font-bold text-slate-300 hover:text-brand-orange transition-colors flex items-center gap-1"
              >
                <LayoutDashboard size={12} /> Operator Dashboard
              </button>
              <button 
                onClick={() => setView('driver')}
                className="text-xs font-bold text-slate-300 hover:text-brand-orange transition-colors flex items-center gap-1"
              >
                <Car size={12} /> Driver App
              </button>
            </div>
            <div className="flex gap-8 text-sm font-medium text-slate-500">
              <a href="#" className="hover:text-brand-orange">Privacy Policy</a>
              <a href="#" className="hover:text-brand-orange">Terms of Service</a>
              <a href="#" className="hover:text-brand-orange">Refund Policy</a>
            </div>
          </div>
        </div>
      </footer>
        </>
      )}
    </div>
  );
}
