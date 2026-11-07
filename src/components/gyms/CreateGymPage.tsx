import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Image as ImageIcon,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Plus,
  Star,
  Check,
  Clock,
  DollarSign,
  Copy,
  Upload,
  ShieldCheck,
  Compass,
  MapPin,
  Phone,
  FileText,
  Sparkles,
} from 'lucide-react';
import type { IOpeningHour, CreateGymPayload } from '../../types';
import { gymService } from '../../api/gymService';
import { useAuth } from '../../context/AuthContext';

const POPULAR_FACILITIES = [
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

const DEFAULT_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export function CreateGymPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSubProvider = user?.role === 'sub_provider';
  const canCreateGym = !isSubProvider || user?.permissions?.canCreateGym !== false;

  // Form State
  const [gymName, setGymName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [city, setCity] = useState<string>('Bangalore');
  const [status, setStatus] = useState<'APPROVED' | 'DRAFT'>('APPROVED');
  const [dayPassPrice, setDayPassPrice] = useState<string>('');
  const [monthlyPrice, setMonthlyPrice] = useState<string>('');
  const [threeMonthPrice, setThreeMonthPrice] = useState<string>('');

  // Average Price Suggestions State
  const [avgPrices, setAvgPrices] = useState<{
    dayPass: number;
    monthly: number;
    threeMonth: number;
    count: number;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    gymService
      .getProviderGyms()
      .then((gyms) => {
        if (!isMounted || !Array.isArray(gyms) || gyms.length === 0) return;

        const dayPasses = gyms.map((g) => Number(g.dayPassPrice)).filter((p) => !isNaN(p) && p > 0);
        const monthlies = gyms.map((g) => Number(g.monthlyMembershipPrice)).filter((p) => !isNaN(p) && p > 0);
        const threeMonths = gyms.map((g) => Number(g.threeMonthMembershipPrice)).filter((p) => !isNaN(p) && p > 0);

        const avgDP = dayPasses.length > 0 ? Math.round(dayPasses.reduce((a, b) => a + b, 0) / dayPasses.length) : 25;
        const avgM = monthlies.length > 0 ? Math.round(monthlies.reduce((a, b) => a + b, 0) / monthlies.length) : 80;
        const avgTM = threeMonths.length > 0 ? Math.round(threeMonths.reduce((a, b) => a + b, 0) / threeMonths.length) : 220;

        setAvgPrices({
          dayPass: avgDP,
          monthly: avgM,
          threeMonth: avgTM,
          count: gyms.length,
        });
      })
      .catch((err) => {
        console.error('Failed to load existing gyms for price averages:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleApplyAllAverages = () => {
    if (!avgPrices) return;
    setDayPassPrice(String(avgPrices.dayPass));
    setMonthlyPrice(String(avgPrices.monthly));
    setThreeMonthPrice(String(avgPrices.threeMonth));
  };
  const [latitude, setLatitude] = useState<string>('12.9716');
  const [longitude, setLongitude] = useState<string>('77.5946');
  const [description, setDescription] = useState<string>('');
  const [facilities, setFacilities] = useState<string[]>([
    'Air Conditioning',
    'Free Weights',
    'Cardio Equipment',
    'Locker Rooms',
    'Wi-Fi',
  ]);
  const [customFacility, setCustomFacility] = useState<string>('');

  const [openingHours, setOpeningHours] = useState<IOpeningHour[]>(
    DEFAULT_DAYS.map((day) => ({
      day,
      open: '06:00 AM',
      close: '10:00 PM',
      isClosed: day === 'Sunday',
    }))
  );

  // Photos State
  const [photos, setPhotos] = useState<string[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState<string>('');
  const [isUploadingFiles, setIsUploadingFiles] = useState<boolean>(false);
  const [uploadProgressText, setUploadProgressText] = useState<string>('');

  // Submit & Feedback State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Toggle Facility
  const toggleFacility = (facility: string) => {
    setFacilities((prev) =>
      prev.includes(facility) ? prev.filter((f) => f !== facility) : [...prev, facility]
    );
  };

  const handleAddCustomFacility = () => {
    const trimmed = customFacility.trim();
    if (!trimmed) return;
    if (!facilities.includes(trimmed)) {
      setFacilities((prev) => [...prev, trimmed]);
    }
    setCustomFacility('');
  };

  // Hour Change
  const handleHourChange = (
    index: number,
    field: keyof IOpeningHour,
    value: string | boolean
  ) => {
    setOpeningHours((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Apply Monday hours to all weekdays
  const handleCopyMonHours = () => {
    const mon = openingHours.find((h) => h.day === 'Monday') || {
      open: '06:00 AM',
      close: '10:00 PM',
      isClosed: false,
    };
    setOpeningHours((prev) =>
      prev.map((slot) => {
        if (['Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(slot.day)) {
          return { ...slot, open: mon.open, close: mon.close, isClosed: mon.isClosed };
        }
        return slot;
      })
    );
  };

  // Handle S3 Direct File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    setIsUploadingFiles(true);
    setUploadProgressText(`Uploading ${fileList.length} image${fileList.length > 1 ? 's' : ''} to storage...`);
    setFeedback(null);

    try {
      const uploadedUrls = await gymService.uploadImages(fileList);
      if (uploadedUrls.length > 0) {
        setPhotos((prev) => [...prev, ...uploadedUrls]);
        setFeedback({
          type: 'success',
          text: `Successfully uploaded ${uploadedUrls.length} photo${uploadedUrls.length > 1 ? 's' : ''} to S3 bucket!`,
        });
      } else {
        setFeedback({
          type: 'error',
          text: 'No image URLs were returned from the upload service.',
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload images.';
      setFeedback({ type: 'error', text: msg });
    } finally {
      setIsUploadingFiles(false);
      setUploadProgressText('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Add Manual Photo URL
  const handleAddPhotoUrl = () => {
    const trimmed = newPhotoUrl.trim();
    if (!trimmed) return;
    if (photos.includes(trimmed)) {
      setFeedback({ type: 'error', text: 'This photo is already in the gallery.' });
      return;
    }
    setPhotos((prev) => [...prev, trimmed]);
    setNewPhotoUrl('');
  };

  // Remove Photo
  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Make Cover
  const handleMakeCover = (index: number) => {
    if (index === 0) return;
    setPhotos((prev) => {
      const target = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [target, ...rest];
    });
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!canCreateGym) {
      setFeedback({
        type: 'error',
        text: 'Access Denied: You do not have permission to create a gym.',
      });
      return;
    }

    if (!gymName.trim()) {
      setFeedback({ type: 'error', text: 'Please enter a valid gym name.' });
      return;
    }
    if (!phoneNumber.trim()) {
      setFeedback({ type: 'error', text: 'Please enter a contact phone number.' });
      return;
    }
    if (!address.trim()) {
      setFeedback({ type: 'error', text: 'Please enter a physical gym address.' });
      return;
    }
    if (!city.trim()) {
      setFeedback({ type: 'error', text: 'Please specify the city.' });
      return;
    }

    const dayPass = parseFloat(dayPassPrice);
    if (isNaN(dayPass) || dayPass < 0) {
      setFeedback({ type: 'error', text: 'Please enter a valid day pass price.' });
      return;
    }

    const payload: CreateGymPayload = {
      gymName: gymName.trim(),
      phoneNumber: phoneNumber.trim(),
      address: address.trim(),
      city: city.trim(),
      status,
      dayPassPrice: dayPass,
      description: description.trim(),
      facilities,
      openingHours,
      photos,
      providerId: user?.id || user?._id,
    };

    if (monthlyPrice.trim()) {
      const mPrice = parseFloat(monthlyPrice);
      if (!isNaN(mPrice) && mPrice >= 0) {
        payload.monthlyMembershipPrice = mPrice;
      }
    }

    if (threeMonthPrice.trim()) {
      const tmPrice = parseFloat(threeMonthPrice);
      if (!isNaN(tmPrice) && tmPrice >= 0) {
        payload.threeMonthMembershipPrice = tmPrice;
      }
    }

    if (latitude.trim() && longitude.trim()) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        payload.gpsLocation = { latitude: lat, longitude: lng };
      }
    }

    try {
      setIsSubmitting(true);
      const newGym = await gymService.createGym(payload);
      setFeedback({
        type: 'success',
        text: `Gym "${newGym.gymName}" created successfully! Redirecting...`,
      });
      setTimeout(() => {
        navigate(`/gyms/${newGym.slug || newGym.id || ''}`);
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create gym.';
      setFeedback({ type: 'error', text: msg });
      setIsSubmitting(false);
    }
  };

  // If sub-provider does not have creation permission
  if (!canCreateGym) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center space-y-4 shadow-xs max-w-2xl mx-auto">
        <AlertCircle className="h-10 w-10 text-amber-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-900">Gym Creation Restricted</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Your account role is sub-provider and does not currently have permission to add new gyms.
          Please contact your primary administrator to request gym creation access.
        </p>
        <button
          onClick={() => navigate('/gyms')}
          className="px-5 py-2.5 bg-[#00A389] text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-[#00917a] transition-colors"
        >
          Return to My Gyms
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 font-sans">
      {/* 1. TOP BREADCRUMB & HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => navigate('/gyms')}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shadow-xs"
            title="Return to My Gyms"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <span>My Gyms</span>
              <span>/</span>
              <span className="text-slate-700">Create New Gym</span>
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
              <span>Register New Fitness Center</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F9F2] text-[#00A389]">
                New Listing
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => navigate('/gyms')}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-700 font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ============================================================== */}
        {/* SECTION 1: BASIC DETAILS & PRICING                             */}
        {/* ============================================================== */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          {/* Card Header Bar */}
          <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-white via-white to-slate-50/60">
            <div className="flex items-center space-x-3.5">
              <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-100 text-[#00A389] flex items-center justify-center shrink-0">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-sm font-bold text-slate-900">1. Basic Information & Pricing</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                    Step 1
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Provide primary identification, location, membership rates, and public status.
                </p>
              </div>
            </div>

            {/* Status Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-500">Listing Status:</span>
              <div className="inline-flex p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setStatus('APPROVED')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    status === 'APPROVED'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Live (Active)
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('DRAFT')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    status === 'DRAFT'
                      ? 'bg-white text-amber-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Draft (Offline)
                </button>
              </div>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Grid 1: Name, Phone, City, Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Gym / Center Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={gymName}
                    onChange={(e) => setGymName(e.target.value)}
                    placeholder="e.g. Iron Forge Elite Fitness"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A389]/20 focus:border-[#00A389]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Contact Phone <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A389]/20 focus:border-[#00A389]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  City <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Bangalore"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A389]/20 focus:border-[#00A389]"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 lg:col-span-4 space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Physical Street Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 104, 12th Main Road, 4th Block, Koramangala"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A389]/20 focus:border-[#00A389]"
                />
              </div>
            </div>

            {/* Pricing Section (Day Pass, 1 Month, 3 Months) */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <label className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                  <DollarSign className="h-4 w-4 text-[#00A389]" />
                  <span>Pricing Plans (₹ INR)</span>
                </label>

                {avgPrices && (
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                      Based on avg of {avgPrices.count} gym{avgPrices.count > 1 ? 's' : ''}
                    </span>
                    <button
                      type="button"
                      onClick={handleApplyAllAverages}
                      className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100/80 border border-teal-200 text-[#00A389] text-[11px] font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
                      title="Apply average prices for Day Pass, 1 Month, and 3 Months"
                    >
                      <Sparkles className="h-3 w-3 text-[#00A389]" />
                      <span>Apply All Averages</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Day Pass */}
                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Day Pass Price</span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      Required
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      required
                      min="0"
                      step="1"
                      value={dayPassPrice}
                      onChange={(e) => setDayPassPrice(e.target.value)}
                      placeholder={avgPrices ? String(avgPrices.dayPass) : '150'}
                      className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A389]/20 focus:border-[#00A389]"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-0.5">
                    <p className="text-[10px] text-slate-400">Single entry walk-in rate.</p>
                    {avgPrices && (
                      <button
                        type="button"
                        onClick={() => setDayPassPrice(String(avgPrices.dayPass))}
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                          dayPassPrice !== '' && Number(dayPassPrice) === avgPrices.dayPass
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-teal-50 hover:bg-teal-100 text-[#00A389] border border-teal-200/90 active:scale-95'
                        }`}
                        title="Click to apply suggested average price"
                      >
                        <Sparkles className="h-2.5 w-2.5 text-[#00A389]" />
                        <span>
                          {dayPassPrice !== '' && Number(dayPassPrice) === avgPrices.dayPass
                            ? `Avg: ₹${avgPrices.dayPass} ✓`
                            : `Suggest: ₹${avgPrices.dayPass}`}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 1 Month Membership */}
                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">1 Month Price</span>
                    <span className="text-[10px] font-medium text-slate-400">Monthly</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={monthlyPrice}
                      onChange={(e) => setMonthlyPrice(e.target.value)}
                      placeholder={avgPrices ? `e.g. ${avgPrices.monthly}` : '1499'}
                      className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A389]/20 focus:border-[#00A389]"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-0.5">
                    <p className="text-[10px] text-slate-400">Regular 1-month plan.</p>
                    {avgPrices && (
                      <button
                        type="button"
                        onClick={() => setMonthlyPrice(String(avgPrices.monthly))}
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                          monthlyPrice !== '' && Number(monthlyPrice) === avgPrices.monthly
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-teal-50 hover:bg-teal-100 text-[#00A389] border border-teal-200/90 active:scale-95'
                        }`}
                        title="Click to apply suggested average price"
                      >
                        <Sparkles className="h-2.5 w-2.5 text-[#00A389]" />
                        <span>
                          {monthlyPrice !== '' && Number(monthlyPrice) === avgPrices.monthly
                            ? `Avg: ₹${avgPrices.monthly} ✓`
                            : `Suggest: ₹${avgPrices.monthly}`}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 3 Months Membership */}
                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">3 Months Price</span>
                    <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                      Quarterly
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={threeMonthPrice}
                      onChange={(e) => setThreeMonthPrice(e.target.value)}
                      placeholder={avgPrices ? `e.g. ${avgPrices.threeMonth}` : '3999'}
                      className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A389]/20 focus:border-[#00A389]"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-0.5">
                    <p className="text-[10px] text-slate-400">3-month discounted bundle.</p>
                    {avgPrices && (
                      <button
                        type="button"
                        onClick={() => setThreeMonthPrice(String(avgPrices.threeMonth))}
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                          threeMonthPrice !== '' && Number(threeMonthPrice) === avgPrices.threeMonth
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-teal-50 hover:bg-teal-100 text-[#00A389] border border-teal-200/90 active:scale-95'
                        }`}
                        title="Click to apply suggested average price"
                      >
                        <Sparkles className="h-2.5 w-2.5 text-[#00A389]" />
                        <span>
                          {threeMonthPrice !== '' && Number(threeMonthPrice) === avgPrices.threeMonth
                            ? `Avg: ₹${avgPrices.threeMonth} ✓`
                            : `Suggest: ₹${avgPrices.threeMonth}`}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* GPS Coordinates */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-900 mb-2 flex items-center space-x-1.5">
                <Compass className="h-4 w-4 text-[#00A389]" />
                <span>Geographic Location (Map Coordinates)</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-600">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="12.9716"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A389]/20 focus:border-[#00A389]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-600">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="77.5946"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A389]/20 focus:border-[#00A389]"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <label className="block text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                <FileText className="h-4 w-4 text-[#00A389]" />
                <span>Gym Description & About Us</span>
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Highlight state-of-the-art machinery, specialized training zones, certified coaches, and member atmosphere..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A389]/20 focus:border-[#00A389]"
              />
            </div>

            {/* Facilities Chips */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-900">
                  Facilities & Amenities ({facilities.length} selected)
                </label>
                <span className="text-[11px] text-slate-400">Click to toggle amenities</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {POPULAR_FACILITIES.map((facility) => {
                  const isSelected = facilities.includes(facility);
                  return (
                    <button
                      key={facility}
                      type="button"
                      onClick={() => toggleFacility(facility)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#00A389] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected ? <Check className="h-3 w-3 stroke-[3]" /> : <Plus className="h-3 w-3 text-slate-400" />}
                      <span>{facility}</span>
                    </button>
                  );
                })}
              </div>

              {/* Add Custom Facility */}
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="text"
                  value={customFacility}
                  onChange={(e) => setCustomFacility(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomFacility();
                    }
                  }}
                  placeholder="Add custom facility (e.g. Olympic Lifting Platform)"
                  className="max-w-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00A389]"
                />
                <button
                  type="button"
                  onClick={handleAddCustomFacility}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Add Custom
                </button>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                    <Clock className="h-4 w-4 text-[#00A389]" />
                    <span>Operating Schedule</span>
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Define daily opening and closing hours for public display.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyMonHours}
                  className="text-xs font-bold text-[#00A389] hover:text-[#008770] flex items-center space-x-1 cursor-pointer self-start sm:self-auto"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Mon to Weekdays</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {openingHours.map((slot, idx) => (
                  <div
                    key={slot.day}
                    className={`p-3 rounded-xl border transition-all ${
                      slot.isClosed
                        ? 'bg-slate-100/70 border-slate-200/60 opacity-75'
                        : 'bg-white border-slate-200 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-800">{slot.day}</span>
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={slot.isClosed}
                          onChange={(e) => handleHourChange(idx, 'isClosed', e.target.checked)}
                          className="rounded text-[#00A389] focus:ring-[#00A389] h-3.5 w-3.5 cursor-pointer"
                        />
                        <span className="text-[11px] font-semibold text-slate-500">Closed</span>
                      </label>
                    </div>

                    {!slot.isClosed ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={slot.open}
                          onChange={(e) => handleHourChange(idx, 'open', e.target.value)}
                          placeholder="06:00 AM"
                          className="w-1/2 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[11px] font-medium text-slate-800 text-center focus:outline-none focus:ring-1 focus:ring-[#00A389]"
                        />
                        <span className="text-slate-400 text-xs">to</span>
                        <input
                          type="text"
                          value={slot.close}
                          onChange={(e) => handleHourChange(idx, 'close', e.target.value)}
                          placeholder="10:00 PM"
                          className="w-1/2 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[11px] font-medium text-slate-800 text-center focus:outline-none focus:ring-1 focus:ring-[#00A389]"
                        />
                      </div>
                    ) : (
                      <div className="text-[11px] font-semibold text-slate-400 py-1 text-center bg-slate-200/50 rounded">
                        Closed for maintenance / holiday
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SECTION 2: PHOTOS & MEDIA (S3 UPLOAD)                          */}
        {/* ============================================================== */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-white via-white to-slate-50/60">
            <div className="flex items-center space-x-3.5">
              <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-100 text-[#00A389] flex items-center justify-center shrink-0">
                <ImageIcon className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-sm font-bold text-slate-900">2. Photos & Media Showcase</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                    Step 2
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Upload gym photos directly to our high-speed S3 storage bucket. The 1st photo is your showcase cover.
                </p>
              </div>
            </div>

            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto">
              {photos.length} Photos Selected
            </span>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Direct S3 Upload Dropzone / Button */}
            <div className="p-6 border-2 border-dashed border-teal-200 rounded-2xl bg-teal-50/30 hover:bg-teal-50/60 transition-colors flex flex-col items-center justify-center text-center space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileUpload}
                className="hidden"
                id="s3-gym-upload"
              />
              <div className="h-12 w-12 rounded-2xl bg-[#00A389]/10 text-[#00A389] flex items-center justify-center">
                {isUploadingFiles ? (
                  <Loader2 className="h-6 w-6 animate-spin text-[#00A389]" />
                ) : (
                  <Upload className="h-6 w-6" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {isUploadingFiles ? uploadProgressText : 'Upload photos directly from your device'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  High-speed upload directly to S3 bucket (PNG, JPG, WEBP up to 10MB each)
                </p>
              </div>

              <label
                htmlFor="s3-gym-upload"
                className={`px-5 py-2.5 bg-[#00A389] hover:bg-[#00917a] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center space-x-2 cursor-pointer ${
                  isUploadingFiles ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                <Upload className="h-4 w-4" />
                <span>{isUploadingFiles ? 'Uploading to S3...' : 'Choose Photos to Upload'}</span>
              </label>
            </div>

            {/* Optional Manual URL Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Or Add Direct Photo URL</label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <input
                  type="url"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPhotoUrl();
                    }
                  }}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A389]/20 focus:border-[#00A389]"
                />
                <button
                  type="button"
                  onClick={handleAddPhotoUrl}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add URL</span>
                </button>
              </div>
            </div>

            {/* Photos Preview Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Gallery Showcase ({photos.length})
                </span>
                <span className="text-[11px] text-slate-400">
                  The first photo is the primary listing thumbnail
                </span>
              </div>

              {photos.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl space-y-1">
                  <ImageIcon className="h-8 w-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">No photos uploaded yet</p>
                  <p className="text-[11px] text-slate-400">
                    Upload gym equipment, facility and studio pictures above.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {photos.map((url, idx) => {
                    const isCover = idx === 0;
                    return (
                      <div
                        key={idx}
                        className={`group relative rounded-2xl overflow-hidden border bg-slate-900 aspect-video flex flex-col justify-between transition-all ${
                          isCover
                            ? 'border-[#00A389] ring-2 ring-[#00A389]/30 shadow-md'
                            : 'border-slate-200 hover:shadow-md'
                        }`}
                      >
                        <img
                          src={url}
                          alt={`Gym Photo ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Cover / Remove Controls */}
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                          {isCover ? (
                            <span className="px-2 py-0.5 rounded-full bg-[#00A389] text-white text-[10px] font-bold flex items-center space-x-1 shadow-md">
                              <Star className="h-3 w-3 fill-white" />
                              <span>Cover</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleMakeCover(idx)}
                              className="px-2 py-0.5 rounded-full bg-black/60 hover:bg-black/80 text-white text-[10px] font-bold backdrop-blur-xs transition-colors cursor-pointer"
                            >
                              Make Cover
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(idx)}
                            className="p-1.5 rounded-full bg-black/60 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                            title="Remove photo"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>

                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-white text-[9px] font-mono">
                          #{idx + 1}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* BOTTOM ACTION BAR                                              */}
        {/* ============================================================== */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-slate-500 text-xs">
            <ShieldCheck className="h-4 w-4 text-[#00A389]" />
            <span>
              Your new listing will be saved as{' '}
              <strong className="text-slate-900">
                {status === 'APPROVED' ? 'Live on GYMON' : 'Draft Mode'}
              </strong>
            </span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => navigate('/gyms')}
              className="w-full sm:w-auto px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploadingFiles}
              className="w-full sm:w-auto px-8 py-2.5 bg-gradient-to-r from-[#00A389] to-[#00C49F] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md shadow-[#00A389]/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{isSubmitting ? 'Creating Gym...' : 'Register & Create Gym'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
