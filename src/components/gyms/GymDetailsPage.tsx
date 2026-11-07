import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Clock,
  Sparkles,
  ExternalLink,
  Pencil,
  CheckCircle2,
  Calendar,
  Layers,
  Compass,
  AlertCircle,
  Dumbbell,
} from 'lucide-react';
import type { GymItem } from '../../types';
import { gymService } from '../../api/gymService';
import { GymDetailsSkeleton } from '../skeletons';

interface GymDetailsPageProps {
  slug?: string;
  onBack?: () => void;
  onEdit?: (gym: GymItem) => void;
  onViewLeads?: (gymSlug: string) => void;
}

export function GymDetailsPage({ slug, onBack, onEdit, onViewLeads }: GymDetailsPageProps) {
  const { slug: urlSlug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const currentSlug = slug || urlSlug || '';

  const [gym, setGym] = useState<GymItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [copiedLink, setCopiedLink] = useState(false);

  const handleBack = () => {
    if (onBack) onBack();
    else navigate('/gyms');
  };

  const handleViewLeads = (targetSlug: string) => {
    if (onViewLeads) onViewLeads(targetSlug);
    else navigate(`/leads?gym=${encodeURIComponent(targetSlug)}`);
  };

  const handleCopyPublicLink = () => {
    const publicUrl = `${window.location.origin}/gyms/${gym?.slug || currentSlug}`;
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    });
  };

  useEffect(() => {
    let isMounted = true;
    const loadGym = async () => {
      if (!currentSlug) return;
      try {
        setIsLoading(true);
        setError(null);
        const data = await gymService.getGymBySlug(currentSlug);
        if (isMounted) {
          setGym(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Could not load gym details.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadGym();
    return () => {
      isMounted = false;
    };
  }, [currentSlug]);

  if (isLoading) {
    return <GymDetailsSkeleton />;
  }

  if (error || !gym) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center space-y-4 shadow-xs">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-900">Gym Not Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">{error || 'No gym details available for this slug.'}</p>
        <button
          onClick={handleBack}
          className="px-4 py-2 rounded-xl bg-[#00A389] text-white text-xs font-bold hover:bg-[#00917a] transition-colors"
        >
          Return to My Gyms
        </button>
      </div>
    );
  }

  const isLive = gym.status === 'Live' || gym.status === 'APPROVED';
  const photos = gym.photos && gym.photos.length > 0 ? gym.photos : [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
  ];

  return (
    <div className="space-y-6">
      {/* 1. TOP NAVIGATION & HEADER ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={handleBack}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer group"
        >
          <div className="p-1.5 rounded-lg bg-white border border-slate-200 group-hover:bg-slate-100 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </div>
          <span>Back to My Gyms</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleViewLeads(gym.slug)}
            className="px-4 py-2 bg-teal-50 border border-teal-200 hover:bg-teal-100 text-[#00A389] text-xs font-bold rounded-xl transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
          >
            <span>View Customer Leads</span>
          </button>

          <button
            onClick={() => {
              if (onEdit) onEdit(gym);
              else navigate(`/gyms/${gym.slug}/edit`);
            }}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
          >
            <Pencil className="h-3.5 w-3.5 text-slate-500" />
            <span>Edit Gym</span>
          </button>

          <button
            onClick={handleCopyPublicLink}
            className="px-4 py-2 bg-[#00A389] hover:bg-[#00917a] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
            title="Copy Public Listing Link"
          >
            <span>{copiedLink ? 'Link Copied!' : 'Copy Public Link'}</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 2. GYM MAIN INFO HERO BANNER */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-2xl bg-[#060E1E] border border-slate-800 text-[#00C49F] flex items-center justify-center font-black text-xl shadow-md shrink-0">
            <Dumbbell className="h-8 w-8 text-[#00C49F]" />
          </div>

          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {gym.gymName}
              </h1>
              <span
                className={`px-3 py-0.5 rounded-full text-[11px] font-bold ${isLive
                    ? 'bg-[#E6F9F2] text-[#00A389] border border-[#00A389]/20'
                    : 'bg-[#FEF6E7] text-[#D97706] border border-amber-300'
                  }`}
              >
                {isLive ? 'Live' : 'Draft'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium mt-1">
              <span className="flex items-center">
                <MapPin className="h-3.5 w-3.5 text-slate-400 mr-1" />
                {gym.city || gym.address}
              </span>
              <span>&bull;</span>
              <span className="font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                slug: {gym.slug}
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Quick Display */}
        <div className="flex items-center space-x-6 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 w-full md:w-auto justify-between md:justify-end">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase">Day Pass</p>
            <p className="text-xl font-black text-slate-900">
              {gym.dayPassPrice > 0 ? `₹${gym.dayPassPrice}` : 'Unpriced'}
            </p>
          </div>
          {gym.monthlyMembershipPrice ? (
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Monthly</p>
              <p className="text-xl font-black text-slate-900">₹{gym.monthlyMembershipPrice}</p>
            </div>
          ) : null}
          {gym.threeMonthMembershipPrice ? (
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase">3 Months</p>
              <p className="text-xl font-black text-teal-700">₹{gym.threeMonthMembershipPrice}</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* 3. PHOTO GALLERY */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="h-72 sm:h-96 w-full rounded-xl overflow-hidden bg-slate-900 relative">
          <img
            src={photos[activePhotoIndex]}
            alt={gym.gymName}
            className="w-full h-full object-cover transition-all duration-300"
          />
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-xs text-white text-xs px-3 py-1.5 rounded-lg font-medium">
            Photo {activePhotoIndex + 1} of {photos.length}
          </div>
        </div>

        {photos.length > 1 && (
          <div className="flex items-center space-x-3 overflow-x-auto pb-2">
            {photos.map((url, idx) => (
              <button
                key={idx}
                onClick={() => setActivePhotoIndex(idx)}
                className={`h-16 w-24 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${activePhotoIndex === idx
                    ? 'border-[#00A389] scale-105 shadow-md'
                    : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
              >
                <img src={url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. DETAILS GRID (DESCRIPTION, FACILITIES, HOURS & LOCATION) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols wide): About & Facilities */}
        <div className="lg:col-span-2 space-y-6">
          {/* About Section */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-[#00A389]" />
              <span>About the Gym</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {gym.description ||
                'This gym is officially registered on GYMON. It features top-grade equipment, qualified trainers, and offers day passes as well as long-term memberships for fitness enthusiasts.'}
            </p>
          </div>

          {/* Facilities & Amenities */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Layers className="h-4 w-4 text-[#00A389]" />
              <span>Facilities & Amenities</span>
            </h3>

            {gym.facilities && gym.facilities.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {gym.facilities.map((fac, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#00A389]" />
                    <span>{fac}</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No facilities listed yet.</p>
            )}
          </div>

          {/* Operating Hours */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Clock className="h-4 w-4 text-[#00A389]" />
              <span>Operating Hours</span>
            </h3>

            {gym.openingHours && gym.openingHours.length > 0 ? (
              <div className="divide-y divide-slate-100 text-xs">
                {gym.openingHours.map((slot, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{slot.day}</span>
                    <span className="text-slate-600">
                      {slot.isClosed ? (
                        <span className="text-rose-500 font-semibold">Closed</span>
                      ) : (
                        `${slot.open} – ${slot.close}`
                      )}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Hours not configured.</p>
            )}
          </div>
        </div>

        {/* Right Column: Contact, Location & System Info */}
        <div className="space-y-6">
          {/* Location & Contact Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Compass className="h-4 w-4 text-[#00A389]" />
              <span>Location & Contact</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">{gym.address}</p>
                  <p className="text-slate-500 mt-0.5">{gym.city}</p>
                </div>
              </div>

              {gym.phoneNumber && (
                <div className="flex items-center space-x-3 pt-2 border-t border-slate-100">
                  <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                  <a
                    href={`tel:${gym.phoneNumber}`}
                    className="font-semibold text-[#00A389] hover:underline"
                  >
                    {gym.phoneNumber}
                  </a>
                </div>
              )}

              {gym.gpsLocation && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">GPS Coordinates</p>
                  <p className="font-mono text-slate-600 mt-0.5">
                    {gym.gpsLocation.latitude.toFixed(4)}, {gym.gpsLocation.longitude.toFixed(4)}
                  </p>
                  <a
                    href={`https://maps.google.com/?q=${gym.gpsLocation.latitude},${gym.gpsLocation.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 text-xs text-[#00A389] hover:underline mt-1 font-semibold"
                  >
                    <span>View on Google Maps</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Listing Status & Meta Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-[#00A389]" />
              <span>Listing Metadata</span>
            </h3>

            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="py-1.5 flex justify-between">
                <span className="text-slate-500">Status</span>
                <span className="font-bold text-slate-800">{isLive ? 'Active / Live' : 'Draft'}</span>
              </div>
              <div className="py-1.5 flex justify-between">
                <span className="text-slate-500">Slug Identifier</span>
                <span className="font-mono text-slate-800">{gym.slug}</span>
              </div>
              <div className="py-1.5 flex justify-between">
                <span className="text-slate-500">Last Updated</span>
                <span className="text-slate-800 font-medium">{gym.updatedAt || 'Recently'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

