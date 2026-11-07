import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Sparkles,
  DollarSign,
  Copy,
  ExternalLink,
  ShieldCheck,
  Compass,
  Upload,
} from 'lucide-react';
import type { IOpeningHour, UpdateGymPayload } from '../../types';
import { gymService } from '../../api/gymService';
import { useAuth } from '../../context/AuthContext';
import { EditGymSkeleton } from '../skeletons';

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

const QUICK_PHOTO_PRESETS = [
  { name: 'Cardio Deck', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Strength & Weights', url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1200&q=80' },
  { name: 'CrossFit Zone', url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Lockers & Amenities', url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1200&q=80' },
];

export function EditGymPage() {
  const { slug: urlSlug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isSubProvider = user?.role === 'sub_provider';
  const canEditGym = !isSubProvider || user?.permissions?.canEditGym !== false;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // ==================== 1. BASIC DETAILS STATE ====================
  const [gymName, setGymName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [status, setStatus] = useState<string>('APPROVED');
  const [dayPassPrice, setDayPassPrice] = useState<string>('0');
  const [monthlyPrice, setMonthlyPrice] = useState<string>('');
  const [threeMonthPrice, setThreeMonthPrice] = useState<string>('');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [facilities, setFacilities] = useState<string[]>([]);
  const [openingHours, setOpeningHours] = useState<IOpeningHour[]>([]);

  const [isSavingDetails, setIsSavingDetails] = useState<boolean>(false);
  const [detailsFeedback, setDetailsFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // ==================== 2. PHOTOS STATE ====================
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState<string>('');
  const [isUploadingFiles, setIsUploadingFiles] = useState<boolean>(false);
  const [uploadProgressText, setUploadProgressText] = useState<string>('');
  const [isSavingPhotos, setIsSavingPhotos] = useState<boolean>(false);
  const [photosFeedback, setPhotosFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Load gym on mount
  useEffect(() => {
    let isMounted = true;
    if (!urlSlug) {
      setFetchError('Gym identifier is missing.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setFetchError(null);

    gymService
      .getGymBySlug(urlSlug)
      .then((gym) => {
        if (!isMounted) return;

        setGymName(gym.gymName || '');
        setPhoneNumber(gym.phoneNumber || '');
        setAddress(gym.address || '');
        setCity(gym.city || '');
        setStatus(gym.status === 'Live' || gym.status === 'APPROVED' ? 'APPROVED' : 'DRAFT');
        setDayPassPrice(String(gym.dayPassPrice ?? 0));
        setMonthlyPrice(gym.monthlyMembershipPrice ? String(gym.monthlyMembershipPrice) : '');
        setThreeMonthPrice(
          gym.threeMonthMembershipPrice ? String(gym.threeMonthMembershipPrice) : ''
        );
        setLatitude(gym.gpsLocation?.latitude ? String(gym.gpsLocation.latitude) : '');
        setLongitude(gym.gpsLocation?.longitude ? String(gym.gpsLocation.longitude) : '');
        setDescription(gym.description || '');
        setFacilities(gym.facilities || []);

        if (gym.openingHours && gym.openingHours.length > 0) {
          setOpeningHours(gym.openingHours);
        } else {
          setOpeningHours(
            DEFAULT_DAYS.map((day) => ({
              day,
              open: '06:00 AM',
              close: '10:00 PM',
              isClosed: day === 'Sunday',
            }))
          );
        }

        setPhotos(gym.photos || []);
      })
      .catch((err) => {
        if (!isMounted) return;
        setFetchError(err.message || 'Unable to retrieve gym details from server.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [urlSlug]);

  // Facility toggle
  const toggleFacility = (facility: string) => {
    setFacilities((prev) =>
      prev.includes(facility) ? prev.filter((f) => f !== facility) : [...prev, facility]
    );
  };

  // Hour change
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

  // Save Basic Details
  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setDetailsFeedback(null);

    if (!gymName.trim()) {
      setDetailsFeedback({ type: 'error', text: 'Gym name is required.' });
      return;
    }
    if (!phoneNumber.trim()) {
      setDetailsFeedback({ type: 'error', text: 'Phone number is required.' });
      return;
    }
    if (!address.trim()) {
      setDetailsFeedback({ type: 'error', text: 'Address is required.' });
      return;
    }
    if (!city.trim()) {
      setDetailsFeedback({ type: 'error', text: 'City is required.' });
      return;
    }

    const payload: UpdateGymPayload = {
      gymName: gymName.trim(),
      phoneNumber: phoneNumber.trim(),
      address: address.trim(),
      city: city.trim(),
      status,
      dayPassPrice: parseFloat(dayPassPrice) || 0,
      description: description.trim(),
      facilities,
      openingHours,
    };

    if (monthlyPrice.trim()) {
      payload.monthlyMembershipPrice = parseFloat(monthlyPrice) || 0;
    }
    if (threeMonthPrice.trim()) {
      payload.threeMonthMembershipPrice = parseFloat(threeMonthPrice) || 0;
    }

    if (latitude.trim() && longitude.trim()) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        payload.gpsLocation = { latitude: lat, longitude: lng };
      }
    }

    try {
      setIsSavingDetails(true);
      await gymService.updateGym(urlSlug || '', payload);
      setDetailsFeedback({ type: 'success', text: 'Gym details saved successfully!' });
      setTimeout(() => setDetailsFeedback(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save gym details.';
      setDetailsFeedback({ type: 'error', text: msg });
    } finally {
      setIsSavingDetails(false);
    }
  };

  // Photos Actions
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    setIsUploadingFiles(true);
    setUploadProgressText(`Uploading ${fileList.length} image${fileList.length > 1 ? 's' : ''} to S3...`);
    setPhotosFeedback(null);

    try {
      const uploadedUrls = await gymService.uploadImages(fileList);
      if (uploadedUrls.length > 0) {
        setPhotos((prev) => [...prev, ...uploadedUrls]);
        setPhotosFeedback({
          type: 'success',
          text: `Uploaded ${uploadedUrls.length} image${uploadedUrls.length > 1 ? 's' : ''} to S3 bucket! Click "Save Photos" to persist changes.`,
        });
      } else {
        setPhotosFeedback({
          type: 'error',
          text: 'No image URLs were returned from the server.',
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload images.';
      setPhotosFeedback({ type: 'error', text: msg });
    } finally {
      setIsUploadingFiles(false);
      setUploadProgressText('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddPhoto = () => {
    const trimmed = newPhotoUrl.trim();
    if (!trimmed) return;
    if (photos.includes(trimmed)) {
      setPhotosFeedback({ type: 'error', text: 'This photo is already in the gallery.' });
      return;
    }
    setPhotos((prev) => [...prev, trimmed]);
    setNewPhotoUrl('');
    setPhotosFeedback(null);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotosFeedback(null);
  };

  const handleMakeCover = (index: number) => {
    if (index === 0) return;
    setPhotos((prev) => {
      const target = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [target, ...rest];
    });
    setPhotosFeedback({
      type: 'success',
      text: 'Primary cover photo assigned! Click "Save Photos" to confirm changes.',
    });
  };

  // Save Photos
  const handleSavePhotos = async () => {
    setPhotosFeedback(null);

    try {
      setIsSavingPhotos(true);
      await gymService.updateGymPhotos(urlSlug || '', photos);
      setPhotosFeedback({ type: 'success', text: 'Photos saved successfully!' });
      setTimeout(() => setPhotosFeedback(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save gym photos.';
      setPhotosFeedback({ type: 'error', text: msg });
    } finally {
      setIsSavingPhotos(false);
    }
  };

  if (isLoading) {
    return <EditGymSkeleton />;
  }

  if (fetchError) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center space-y-4 shadow-xs">
        <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
        <h3 className="text-sm font-bold text-slate-900">Gym Not Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">{fetchError}</p>
        <button
          onClick={() => navigate('/gyms')}
          className="px-4 py-2 bg-[#00A389] text-white text-xs font-bold rounded-xl cursor-pointer"
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
            onClick={() => navigate(`/gyms/${urlSlug}`)}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shadow-xs"
            title="Back to Gym Details"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <span>My Gyms</span>
              <span>/</span>
              <span className="text-slate-600 truncate max-w-[200px]">{gymName}</span>
              <span>/</span>
              <span className="text-[#00A389]">Edit</span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Edit Gym Profile
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => navigate(`/gyms/${urlSlug}`)}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
          >
            <span>Preview Details</span>
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION 1: GYM DETAILS (INDEPENDENT SAVE)                      */}
      {/* ============================================================== */}
      <form
        onSubmit={handleSaveDetails}
        className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden"
      >
        {/* Card Header Bar */}
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-white via-white to-slate-50/60">
          <div className="flex items-center space-x-3.5">
            <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-100 text-[#00A389] flex items-center justify-center shrink-0">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-slate-900">1. Gym Details & Operations</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                  Step 1
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Identity, location, membership pricing, description, amenities, and schedules.
              </p>
            </div>
          </div>

          {/* Segmented Status Pill */}
          <div className="flex items-center p-1 bg-slate-100 border border-slate-200/80 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => setStatus('APPROVED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                status === 'APPROVED'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Live on GYMON</span>
            </button>
            <button
              type="button"
              onClick={() => setStatus('DRAFT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                status === 'DRAFT'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Draft Mode</span>
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {!canEditGym && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center space-x-2.5 shadow-xs">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>
                Read-Only Mode: As a sub-provider without gym editing privileges, you can inspect details here, but editing is restricted by your primary provider.
              </span>
            </div>
          )}

          {/* Sub-section A: Identity & Contact */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <span>Basic Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Gym Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={gymName}
                  onChange={(e) => setGymName(e.target.value)}
                  placeholder="e.g. Iron Fitness Center"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A389]/20 focus:border-[#00A389] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A389]/20 focus:border-[#00A389] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  City <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Bangalore"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A389]/20 focus:border-[#00A389] transition-all"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Full Physical Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 4th Floor, Platinum Plaza, 100 Ft Road, Indiranagar"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A389]/20 focus:border-[#00A389] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Sub-section B: Pricing & Membership Tiers */}
          <div className="pt-2 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                <span>Pricing Plans & Membership</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">All amounts in INR (₹)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Day Pass */}
              <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Day Pass Price</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                    Mandatory
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={dayPassPrice}
                    onChange={(e) => setDayPassPrice(e.target.value)}
                    placeholder="150"
                    className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A389]/20 focus:border-[#00A389]"
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-medium">Single entry pass rate</p>
              </div>

              {/* 1 Month */}
              <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">1 Month Membership</span>
                  <span className="text-[10px] font-semibold text-slate-400">Optional</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={monthlyPrice}
                    onChange={(e) => setMonthlyPrice(e.target.value)}
                    placeholder="1500"
                    className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A389]/20 focus:border-[#00A389]"
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-medium">Monthly subscription</p>
              </div>

              {/* 3 Months */}
              <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">3 Months Membership</span>
                  <span className="text-[10px] font-semibold text-slate-400">Optional</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={threeMonthPrice}
                    onChange={(e) => setThreeMonthPrice(e.target.value)}
                    placeholder="3800"
                    className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A389]/20 focus:border-[#00A389]"
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-medium">Quarterly package</p>
              </div>
            </div>
          </div>

          {/* Sub-section C: About / Description */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="h-3.5 w-3.5 text-slate-400" />
              <span>About Gym & Atmosphere</span>
            </h3>

            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Highlight equipment brands, qualified trainers, special workout zones, changing rooms, and member community..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A389]/20 focus:border-[#00A389] transition-all resize-y leading-relaxed"
            />
          </div>

          {/* Sub-section D: Facilities & Amenities */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Facilities & Amenities
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">
                {facilities.length} Selected
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {POPULAR_FACILITIES.map((fac) => {
                const isSelected = facilities.includes(fac);
                return (
                  <button
                    key={fac}
                    type="button"
                    onClick={() => toggleFacility(fac)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#00A389] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                    }`}
                  >
                    {isSelected ? (
                      <Check className="h-3.5 w-3.5 stroke-[3] text-white" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                    )}
                    <span>{fac}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sub-section E: Operating Hours */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>Operating Hours Schedule</span>
              </h3>
              <button
                type="button"
                onClick={handleCopyMonHours}
                className="text-xs font-bold text-[#00A389] hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Apply Monday to all weekdays</span>
              </button>
            </div>

            <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl overflow-hidden divide-y divide-slate-100">
              {openingHours.map((slot, idx) => (
                <div
                  key={slot.day}
                  className="px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <span className="w-28 font-bold text-slate-800">{slot.day}</span>

                  <div className="flex items-center space-x-3">
                    <label className="inline-flex items-center space-x-1.5 text-slate-600 cursor-pointer mr-2 select-none">
                      <input
                        type="checkbox"
                        checked={Boolean(slot.isClosed)}
                        onChange={(e) => handleHourChange(idx, 'isClosed', e.target.checked)}
                        className="rounded border-slate-300 text-[#00A389] focus:ring-[#00A389]"
                      />
                      <span className="text-[11px] font-medium">Closed</span>
                    </label>

                    {!slot.isClosed ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={slot.open}
                          onChange={(e) => handleHourChange(idx, 'open', e.target.value)}
                          placeholder="06:00 AM"
                          className="w-24 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-center font-bold text-slate-800 text-xs shadow-2xs focus:ring-1 focus:ring-[#00A389]"
                        />
                        <span className="text-slate-400 font-semibold">to</span>
                        <input
                          type="text"
                          value={slot.close}
                          onChange={(e) => handleHourChange(idx, 'close', e.target.value)}
                          placeholder="10:00 PM"
                          className="w-24 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-center font-bold text-slate-800 text-xs shadow-2xs focus:ring-1 focus:ring-[#00A389]"
                        />
                      </div>
                    ) : (
                      <span className="text-rose-600 font-semibold px-4 py-1.5 bg-rose-50 rounded-lg text-xs w-52 text-center">
                        Closed for visitors
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sub-section F: Location GPS */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Compass className="h-3.5 w-3.5 text-slate-400" />
              <span>Location Coordinates (GPS)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g. 12.9716"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#00A389]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g. 77.5946"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#00A389]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card Footer Action Bar */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          {detailsFeedback ? (
            <div
              className={`text-xs font-semibold flex items-center space-x-2 ${
                detailsFeedback.type === 'success' ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {detailsFeedback.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-600" />
              )}
              <span>{detailsFeedback.text}</span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-400">
              Only basic and operational details are saved here.
            </span>
          )}

          <button
            type="submit"
            disabled={isSavingDetails || !canEditGym}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#00A389] hover:bg-[#00917a] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSavingDetails ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{isSavingDetails ? 'Saving Details...' : 'Save Gym Details'}</span>
          </button>
        </div>
      </form>

      {/* ============================================================== */}
      {/* SECTION 2: GYM PHOTOS (INDEPENDENT SAVE)                       */}
      {/* ============================================================== */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Card Header Bar */}
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
                Manage public listing photos. The first image is your primary showcase cover.
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto">
            {photos.length} Photos in Gallery
          </span>
        </div>

        {/* Card Body */}
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
              id="s3-gym-upload-edit"
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
                {isUploadingFiles ? uploadProgressText : 'Upload photos directly from your computer'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Saved instantly to your GYMON S3 storage bucket (PNG, JPG, WEBP)
              </p>
            </div>

            <label
              htmlFor="s3-gym-upload-edit"
              className={`px-5 py-2.5 bg-[#00A389] hover:bg-[#00917a] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center space-x-2 cursor-pointer ${
                isUploadingFiles ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <Upload className="h-4 w-4" />
              <span>{isUploadingFiles ? 'Uploading to S3...' : 'Upload Photos'}</span>
            </label>
          </div>

          {/* Add Image Input Bar */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Or Paste Image URL</label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <input
                type="url"
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPhoto();
                  }
                }}
                placeholder="Paste direct image URL (e.g. https://images.unsplash.com/...)"
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A389]/20 focus:border-[#00A389]"
              />
              <button
                type="button"
                onClick={handleAddPhoto}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>Add to Gallery</span>
              </button>
            </div>

            {/* Quick Sample Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-medium text-slate-400">Sample presets:</span>
              {QUICK_PHOTO_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    if (!photos.includes(preset.url)) {
                      setPhotos((prev) => [...prev, preset.url]);
                    }
                  }}
                  className="px-2.5 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-medium transition-colors cursor-pointer"
                >
                  + {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Photos Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Current Photos
              </span>
              <span className="text-[11px] text-slate-400">
                Click &quot;Make Cover&quot; to set the primary card image
              </span>
            </div>

            {photos.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-2">
                <ImageIcon className="h-10 w-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No photos configured</p>
                <p className="text-[11px] text-slate-400">
                  Add image URLs above to create your gym showcase.
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

                      {/* Cover Badge / Make Cover */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                        {isCover ? (
                          <span className="px-2.5 py-1 rounded-full bg-[#00A389] text-white text-[10px] font-bold flex items-center space-x-1 shadow-md">
                            <Star className="h-3 w-3 fill-white" />
                            <span>Cover</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleMakeCover(idx)}
                            className="px-2.5 py-1 rounded-full bg-black/60 hover:bg-black/80 text-white text-[10px] font-bold backdrop-blur-xs transition-colors cursor-pointer"
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

        {/* Card Footer Action Bar */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          {photosFeedback ? (
            <div
              className={`text-xs font-semibold flex items-center space-x-2 ${
                photosFeedback.type === 'success' ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {photosFeedback.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-600" />
              )}
              <span>{photosFeedback.text}</span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-400">
              Only photo gallery items and cover order are saved here.
            </span>
          )}

          <button
            type="button"
            onClick={handleSavePhotos}
            disabled={isSavingPhotos || isUploadingFiles || !canEditGym}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#00A389] hover:bg-[#00917a] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSavingPhotos ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{isSavingPhotos ? 'Saving Photos...' : isUploadingFiles ? 'Uploading Photos...' : 'Save Photos'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
