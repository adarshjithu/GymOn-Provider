import { useState } from 'react';
import {
  X,
  Building2,
  MapPin,
  Phone,
  Sparkles,
  Check,
  AlertCircle,
  Loader2,
  Clock,
  Plus,
} from 'lucide-react';
import { gymService } from '../../api/gymService';
import type { GymItem } from '../../types';

interface CreateGymModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGymCreated: (gym: GymItem) => void;
  providerId?: string;
}

const AVAILABLE_FACILITIES = [
  'Cardio Equipment',
  'Free Weights',
  'CrossFit Zone',
  'Personal Training',
  'Locker Rooms',
  'Showers',
  'Steam & Sauna',
  'Air Conditioning',
  'Wi-Fi',
  'Parking',
  'Yoga Studio',
  'Juice Bar & Café',
];

const PHOTO_PRESETS = [
  { name: 'Cardio Deck', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Strength & Weights', url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1200&q=80' },
  { name: 'CrossFit Floor', url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Lockers & Spa', url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1200&q=80' },
];

export function CreateGymModal({ isOpen, onClose, onGymCreated, providerId }: CreateGymModalProps) {
  const [gymName, setGymName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [dayPassPrice, setDayPassPrice] = useState('150');
  const [monthlyPrice, setMonthlyPrice] = useState('1499');
  const [threeMonthPrice, setThreeMonthPrice] = useState('3999');
  const [latitude, setLatitude] = useState('12.9716');
  const [longitude, setLongitude] = useState('77.5946');
  const [description, setDescription] = useState('');
  const [facilities, setFacilities] = useState<string[]>([
    'Air Conditioning',
    'Free Weights',
    'Cardio Equipment',
    'Locker Rooms',
  ]);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([
    PHOTO_PRESETS[0]!.url,
  ]);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleFacility = (facility: string) => {
    if (facilities.includes(facility)) {
      setFacilities(facilities.filter((f) => f !== facility));
    } else {
      setFacilities([...facilities, facility]);
    }
  };

  const togglePhotoPreset = (url: string) => {
    if (selectedPhotos.includes(url)) {
      if (selectedPhotos.length > 1) {
        setSelectedPhotos(selectedPhotos.filter((p) => p !== url));
      }
    } else {
      setSelectedPhotos([...selectedPhotos, url]);
    }
  };

  const handleAddCustomPhoto = () => {
    if (customPhotoUrl.trim() && !selectedPhotos.includes(customPhotoUrl.trim())) {
      setSelectedPhotos([...selectedPhotos, customPhotoUrl.trim()]);
      setCustomPhotoUrl('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!gymName.trim()) {
      setErrorMessage('Please enter a gym name.');
      return;
    }
    if (!address.trim() || !city.trim()) {
      setErrorMessage('Please enter a valid address and city.');
      return;
    }
    if (!phoneNumber.trim()) {
      setErrorMessage('Please enter a contact phone number.');
      return;
    }
    const dpPrice = Number(dayPassPrice);
    if (isNaN(dpPrice) || dpPrice < 0) {
      setErrorMessage('Please provide a valid day-pass price.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        providerId,
        gymName: gymName.trim(),
        address: address.trim(),
        city: city.trim(),
        phoneNumber: phoneNumber.trim(),
        dayPassPrice: dpPrice,
        monthlyMembershipPrice: monthlyPrice ? Number(monthlyPrice) : undefined,
        threeMonthMembershipPrice: threeMonthPrice ? Number(threeMonthPrice) : undefined,
        description: description.trim(),
        facilities,
        photos: selectedPhotos,
        gpsLocation: {
          latitude: Number(latitude) || 12.9716,
          longitude: Number(longitude) || 77.5946,
        },
        openingHours: [
          { day: 'Monday - Friday', open: '06:00 AM', close: '10:00 PM', isClosed: false },
          { day: 'Saturday - Sunday', open: '07:00 AM', close: '08:00 PM', isClosed: false },
        ],
      };

      const newGym = await gymService.createGym(payload);
      onGymCreated(newGym);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to submit gym for approval.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200/90 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#00A389]">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Add New Gym Facility
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Submit gym details for verification & admin approval
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Approval Notice Banner */}
        <div className="bg-amber-50/70 border-b border-amber-100/80 px-6 py-3 flex items-start space-x-3 text-xs text-amber-800">
          <Clock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Admin Verification Notice:</span> Newly submitted gyms are reviewed by GYMON Main Admin. Once approved, your gym will automatically go live to customers on the platform.
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Basic Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              1. Basic Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Gym Name *
                </label>
                <input
                  type="text"
                  required
                  value={gymName}
                  onChange={(e) => setGymName(e.target.value)}
                  placeholder="e.g. FitZone Elite Fitness"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00C49F] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Contact Phone Number *
                </label>
                <div className="relative">
                  <Phone className="h-3.5 w-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00C49F] focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Full Street Address *
                </label>
                <div className="relative">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="12th Main, 4th Block, Koramangala"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00C49F] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Bengaluru"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00C49F] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Latitude / Longitude
                </label>
                <div className="flex space-x-1">
                  <input
                    type="text"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="12.9716"
                    className="w-1/2 bg-slate-50 border border-slate-200 rounded-lg px-2 py-2.5 text-[11px]"
                    title="Latitude"
                  />
                  <input
                    type="text"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="77.5946"
                    className="w-1/2 bg-slate-50 border border-slate-200 rounded-lg px-2 py-2.5 text-[11px]"
                    title="Longitude"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              2. Membership & Pass Pricing
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-emerald-50/40 border border-emerald-100/80 rounded-xl p-3">
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  1-Day Pass (₹) *
                </label>
                <div className="relative">
                  <span className="text-slate-400 font-bold text-xs absolute left-3 top-1/2 -translate-y-1/2">₹</span>
                  <input
                    type="number"
                    required
                    min="0"
                    value={dayPassPrice}
                    onChange={(e) => setDayPassPrice(e.target.value)}
                    placeholder="150"
                    className="w-full bg-white border border-slate-200 rounded-lg pl-7 pr-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Monthly Pass (₹)
                </label>
                <div className="relative">
                  <span className="text-slate-400 font-bold text-xs absolute left-3 top-1/2 -translate-y-1/2">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={monthlyPrice}
                    onChange={(e) => setMonthlyPrice(e.target.value)}
                    placeholder="1499"
                    className="w-full bg-white border border-slate-200 rounded-lg pl-7 pr-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#00C49F]"
                  />
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  3-Month Pass (₹)
                </label>
                <div className="relative">
                  <span className="text-slate-400 font-bold text-xs absolute left-3 top-1/2 -translate-y-1/2">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={threeMonthPrice}
                    onChange={(e) => setThreeMonthPrice(e.target.value)}
                    placeholder="3999"
                    className="w-full bg-white border border-slate-200 rounded-lg pl-7 pr-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#00C49F]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Facilities */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              3. Available Facilities & Equipment
            </h4>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_FACILITIES.map((facility) => {
                const isSelected = facilities.includes(facility);
                return (
                  <button
                    type="button"
                    key={facility}
                    onClick={() => toggleFacility(facility)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center space-x-1.5 ${
                      isSelected
                        ? 'bg-teal-50 border border-[#00C49F] text-[#00A389]'
                        : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                    <span>{facility}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="url"
                value={customPhotoUrl}
                onChange={(e) => setCustomPhotoUrl(e.target.value)}
                placeholder="Or paste an image URL..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#00C49F]"
              />
              <button
                type="button"
                onClick={handleAddCustomPhoto}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center space-x-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add URL</span>
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-700 block">
              Gym Description & Highlights
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Modern fitness center equipped with imported equipment, certified trainers, and clean locker rooms..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00C49F] focus:bg-white transition-all"
            />
          </div>

          {/* Photos */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              4. Photos Preview
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PHOTO_PRESETS.map((preset) => {
                const isSelected = selectedPhotos.includes(preset.url);
                return (
                  <div
                    key={preset.name}
                    onClick={() => togglePhotoPreset(preset.url)}
                    className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all group aspect-video ${
                      isSelected ? 'border-[#00C49F] ring-2 ring-[#00C49F]/30' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1 text-[10px] text-white font-medium truncate">
                      {preset.name}
                    </div>
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-[#00C49F] text-white flex items-center justify-center">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="url"
                value={customPhotoUrl}
                onChange={(e) => setCustomPhotoUrl(e.target.value)}
                placeholder="Or paste an image URL..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#00C49F]"
              />
              <button
                type="button"
                onClick={handleAddCustomPhoto}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center space-x-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add URL</span>
              </button>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00A389] to-[#00C49F] text-white text-xs font-bold shadow-md shadow-teal-500/20 hover:opacity-95 cursor-pointer flex items-center space-x-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Submitting for Approval...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Submit Gym for Approval</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
