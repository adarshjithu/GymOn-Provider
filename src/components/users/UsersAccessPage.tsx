import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Search,
  Trash2,
  Pencil,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Mail,
  Phone,
  Eye,
  EyeOff,
  Shield,
  RefreshCw,
  Building2,
} from 'lucide-react';
import type { SubProviderItem, CreateSubProviderPayload, SubProviderPermissions, GymItem } from '../../types';
import { subProviderService } from '../../api/subProviderService';
import { gymService } from '../../api/gymService';
import { useAuth } from '../../context/AuthContext';
import { UsersAccessSkeleton, UsersAccessTableSkeleton } from '../skeletons';

const DEFAULT_PERMISSIONS: SubProviderPermissions = {
  canCreateGym: false,
  canEditGym: true,
  canDeleteGym: false,
  canViewLeads: true,
  canManageLeads: true,
};

export function UsersAccessPage() {
  const { user } = useAuth();

  const [subProviders, setSubProviders] = useState<SubProviderItem[]>([]);
  const [gyms, setGyms] = useState<GymItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedSub, setSelectedSub] = useState<SubProviderItem | null>(null);

  // Form States - Add
  const [addName, setAddName] = useState<string>('');
  const [addEmail, setAddEmail] = useState<string>('');
  const [addPhone, setAddPhone] = useState<string>('');
  const [addPassword, setAddPassword] = useState<string>('');
  const [showAddPass, setShowAddPass] = useState<boolean>(false);
  const [addPermissions, setAddPermissions] = useState<SubProviderPermissions>(DEFAULT_PERMISSIONS);
  const [addHasAllGyms, setAddHasAllGyms] = useState<boolean>(true);
  const [addSelectedGymIds, setAddSelectedGymIds] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Form States - Edit
  const [editName, setEditName] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('');
  const [editIsActive, setEditIsActive] = useState<boolean>(true);
  const [editPermissions, setEditPermissions] = useState<SubProviderPermissions>(DEFAULT_PERMISSIONS);
  const [editHasAllGyms, setEditHasAllGyms] = useState<boolean>(true);
  const [editSelectedGymIds, setEditSelectedGymIds] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Form States - Password
  const [newPassword, setNewPassword] = useState<string>('');
  const [showNewPass, setShowNewPass] = useState<boolean>(false);
  const [isChangingPass, setIsChangingPass] = useState<boolean>(false);

  // Form States - Delete
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchSubProviders = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const [list, gymsList] = await Promise.all([
        subProviderService.getSubProviders(),
        gymService.getProviderGyms(user?.id || user?._id).catch(() => [] as GymItem[]),
      ]);
      setSubProviders(list);
      setGyms(Array.isArray(gymsList) ? gymsList : []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch sub-providers.';
      setErrorMsg(msg);
      setSubProviders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubProviders();
  }, [user]);

  // Filtered sub-providers
  const filteredUsers = subProviders.filter((sub) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      sub.name.toLowerCase().includes(q) ||
      sub.email.toLowerCase().includes(q) ||
      sub.phone.toLowerCase().includes(q)
    );
  });

  // Open Add Modal
  const handleOpenAdd = () => {
    setAddName('');
    setAddEmail('');
    setAddPhone('');
    setAddPassword('');
    setAddPermissions(DEFAULT_PERMISSIONS);
    setAddHasAllGyms(true);
    setAddSelectedGymIds([]);
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (sub: SubProviderItem) => {
    setSelectedSub(sub);
    setEditName(sub.name);
    setEditPhone(sub.phone);
    setEditIsActive(sub.isActive);
    setEditPermissions(sub.permissions || DEFAULT_PERMISSIONS);
    setEditHasAllGyms(sub.hasAllGymsAccess !== false);
    const selectedIds = Array.isArray(sub.assignedGyms)
      ? sub.assignedGyms
          .map((g: any) => (typeof g === 'object' && g ? g._id || g.id : g))
          .filter(Boolean)
      : [];
    setEditSelectedGymIds(selectedIds);
    setIsEditModalOpen(true);
  };

  // Open Password Modal
  const handleOpenPassword = (sub: SubProviderItem) => {
    setSelectedSub(sub);
    setNewPassword('');
    setIsPasswordModalOpen(true);
  };

  // Open Delete Modal
  const handleOpenDelete = (sub: SubProviderItem) => {
    setSelectedSub(sub);
    setIsDeleteModalOpen(true);
  };

  // Submit Add
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!addName.trim() || !addEmail.trim() || !addPhone.trim() || !addPassword) {
      setErrorMsg('All fields are required.');
      return;
    }
    if (addPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (!addHasAllGyms && addSelectedGymIds.length === 0) {
      setErrorMsg('Please select at least one gym for this sub-provider, or choose "All Gyms".');
      return;
    }

    try {
      setIsCreating(true);
      const payload: CreateSubProviderPayload = {
        name: addName.trim(),
        email: addEmail.trim(),
        phone: addPhone.trim(),
        password: addPassword,
        permissions: addPermissions,
        hasAllGymsAccess: addHasAllGyms,
        assignedGyms: addHasAllGyms ? [] : addSelectedGymIds,
      };

      await subProviderService.createSubProvider(payload);
      setSuccessMsg(`Sub-provider "${addName}" created successfully!`);
      setIsAddModalOpen(false);

      // Reset form
      setAddName('');
      setAddEmail('');
      setAddPhone('');
      setAddPassword('');
      setAddPermissions(DEFAULT_PERMISSIONS);
      setAddHasAllGyms(true);
      setAddSelectedGymIds([]);

      await fetchSubProviders();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create sub-provider.';
      setErrorMsg(msg);
    } finally {
      setIsCreating(false);
    }
  };

  // Submit Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;
    setErrorMsg(null);

    if (!editHasAllGyms && editSelectedGymIds.length === 0) {
      setErrorMsg('Please select at least one gym for this sub-provider, or choose "All Gyms".');
      return;
    }

    try {
      setIsUpdating(true);
      await subProviderService.updateSubProvider(selectedSub.id, {
        name: editName.trim(),
        phone: editPhone.trim(),
        isActive: editIsActive,
        permissions: editPermissions,
        hasAllGymsAccess: editHasAllGyms,
        assignedGyms: editHasAllGyms ? [] : editSelectedGymIds,
      });

      setSuccessMsg(`Sub-provider "${editName}" updated successfully!`);
      setIsEditModalOpen(false);
      await fetchSubProviders();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update sub-provider.';
      setErrorMsg(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  // Submit Password Change
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;
    setErrorMsg(null);

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }

    try {
      setIsChangingPass(true);
      await subProviderService.changePassword(selectedSub.id, newPassword);
      setSuccessMsg(`Password for "${selectedSub.name}" updated successfully!`);
      setIsPasswordModalOpen(false);
      setNewPassword('');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to change password.';
      setErrorMsg(msg);
    } finally {
      setIsChangingPass(false);
    }
  };

  // Submit Delete
  const handleDeleteSubmit = async () => {
    if (!selectedSub) return;
    try {
      setIsDeleting(true);
      await subProviderService.deleteSubProvider(selectedSub.id);
      setSuccessMsg(`Sub-provider "${selectedSub.name}" removed successfully.`);
      setIsDeleteModalOpen(false);
      await fetchSubProviders();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete sub-provider.';
      setErrorMsg(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading && subProviders.length === 0) {
    return <UsersAccessSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      {/* 1. TOP HEADER & SUMMARY BANNER */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-center space-x-3.5 sm:space-x-4 min-w-0">
          <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-tr from-[#00A389] to-[#00C49F] text-white flex items-center justify-center font-black shadow-md shadow-[#00C49F]/20 shrink-0">
            <ShieldCheck className="h-7 w-7 sm:h-8 sm:w-8 stroke-[2.2]" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
                Users & Access Management
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-[#00A389] border border-teal-200 shrink-0">
                Primary Portal
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5 sm:mt-1 truncate">
              Create sub-providers (staff, managers, trainers) and configure permissions.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setErrorMsg(null);
            handleOpenAdd();
          }}
          className="w-full md:w-auto px-5 py-2.5 bg-[#00A389] hover:bg-[#00917a] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#00A389]/20 flex items-center justify-center space-x-2 cursor-pointer shrink-0"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add Sub-Provider</span>
        </button>
      </div>

      {/* 2. FEEDBACK NOTIFICATIONS */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2.5 shadow-xs animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center space-x-2.5 shadow-xs animate-fadeIn">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 3. ROLES OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Primary Provider */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Primary Account
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
              Admin
            </span>
          </div>
          <p className="text-base font-bold text-slate-900">{user?.name || 'Alex Morgan'}</p>
          <p className="text-xs text-slate-500 font-medium">
            Full root privileges: gym creation, user provisioning & security controls.
          </p>
        </div>

        {/* Card 2: Sub-Providers Count */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Sub-Providers
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-[#00A389] border border-teal-100">
              Staff / Team
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900">{subProviders.length}</p>
          <p className="text-xs text-slate-500 font-medium">
            Authorized accounts with restricted role-based privileges.
          </p>
        </div>

        {/* Card 3: Active Status */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Active Access
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-2xl font-black text-emerald-600">
            {subProviders.filter((s) => s.isActive).length}
          </p>
          <p className="text-xs text-slate-500 font-medium">
            Currently active sub-providers able to log in to GYMON portal.
          </p>
        </div>
      </div>

      {/* 4. SUB-PROVIDERS LIST TABLE */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Table Header Action Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-[#00A389]" />
            <h2 className="text-sm font-bold text-slate-900">Registered Sub-Providers</h2>
            <span className="text-xs text-slate-400">({filteredUsers.length})</span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, phone..."
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A389]/20 focus:border-[#00A389]"
              />
            </div>

            <button
              type="button"
              onClick={fetchSubProviders}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer shrink-0"
              title="Refresh users"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Table Content */}
        {isLoading ? (
          <UsersAccessTableSkeleton />
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 sm:p-16 text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-teal-50 text-[#00A389] flex items-center justify-center mx-auto">
              <UserPlus className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">No Sub-Providers Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? 'No sub-providers match your search query.'
                : 'You have not added any sub-providers yet. Add staff members to delegate gym or lead management.'}
            </p>
            {!searchQuery && (
              <button
                type="button"
                onClick={handleOpenAdd}
                className="px-4 py-2 bg-[#00A389] text-white text-xs font-bold rounded-xl hover:bg-[#00917a] transition-all cursor-pointer"
              >
                Add First Sub-Provider
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-3.5 sm:px-6 py-3 sm:py-4">Sub-Provider</th>
                  <th className="px-3.5 sm:px-6 py-3 sm:py-4">Contact</th>
                  <th className="px-3.5 sm:px-6 py-3 sm:py-4">Assigned Gyms</th>
                  <th className="px-3.5 sm:px-6 py-3 sm:py-4">Status</th>
                  <th className="px-3.5 sm:px-6 py-3 sm:py-4">Assigned Permissions</th>
                  <th className="px-3.5 sm:px-6 py-3 sm:py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((sub) => {
                  const initials = sub.name
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();

                  const perms = sub.permissions || DEFAULT_PERMISSIONS;

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Avatar */}
                      <td className="px-3.5 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-900 text-teal-400 font-bold text-xs flex items-center justify-center shrink-0 shadow-xs border border-slate-800">
                            {initials}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-sm block">
                              {sub.name}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-400 uppercase">
                              Role: Sub-Provider
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="px-3.5 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1.5 text-slate-600 font-medium">
                            <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>{sub.email}</span>
                          </div>
                          <div className="flex items-center space-x-1.5 text-slate-500 font-medium">
                            <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>{sub.phone}</span>
                          </div>
                        </div>
                      </td>

                      {/* Assigned Gyms */}
                      <td className="px-3.5 sm:px-6 py-3 sm:py-4">
                        {sub.hasAllGymsAccess !== false ? (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Building2 className="h-3 w-3 text-emerald-600 shrink-0" />
                            <span>All Gyms (Full Access)</span>
                          </span>
                        ) : sub.assignedGyms && sub.assignedGyms.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 max-w-xs">
                            {sub.assignedGyms.slice(0, 2).map((gymItem: any, idx: number) => {
                              const gymName =
                                typeof gymItem === 'object' && gymItem?.gymName
                                  ? gymItem.gymName
                                  : gyms.find((g) => (g._id || g.id) === gymItem)?.gymName || 'Gym';
                              return (
                                <span
                                  key={idx}
                                  className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200/80 text-[#00A389] text-[10px] font-semibold"
                                >
                                  <Building2 className="h-2.5 w-2.5 shrink-0" />
                                  <span className="truncate max-w-[120px]">{gymName}</span>
                                </span>
                              );
                            })}
                            {sub.assignedGyms.length > 2 && (
                              <span
                                title={sub.assignedGyms
                                  .slice(2)
                                  .map((g: any) => (typeof g === 'object' ? g.gymName : g))
                                  .join(', ')}
                                className="px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold"
                              >
                                +{sub.assignedGyms.length - 2} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            <span>No gyms assigned</span>
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-3.5 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            sub.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              sub.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          <span>{sub.isActive ? 'Active' : 'Inactive'}</span>
                        </span>
                      </td>

                      {/* Permissions Tags */}
                      <td className="px-3.5 sm:px-6 py-3 sm:py-4">
                        <div className="flex flex-wrap gap-1.5 max-w-md">
                          {perms.canEditGym && (
                            <span className="px-2 py-0.5 rounded-md bg-teal-50 border border-teal-100 text-[#00A389] text-[10px] font-semibold">
                              Edit Gyms
                            </span>
                          )}
                          {perms.canCreateGym && (
                            <span className="px-2 py-0.5 rounded-md bg-sky-50 border border-sky-100 text-sky-700 text-[10px] font-semibold">
                              Create Gyms
                            </span>
                          )}
                          {perms.canViewLeads && (
                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-semibold">
                              View Leads
                            </span>
                          )}
                          {perms.canManageLeads && (
                            <span className="px-2 py-0.5 rounded-md bg-purple-50 border border-purple-100 text-purple-700 text-[10px] font-semibold">
                              Manage Leads
                            </span>
                          )}
                          {perms.canDeleteGym && (
                            <span className="px-2 py-0.5 rounded-md bg-rose-50 border border-rose-100 text-rose-700 text-[10px] font-semibold">
                              Delete Gyms
                            </span>
                          )}
                          {!perms.canEditGym && !perms.canCreateGym && !perms.canManageLeads && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-semibold">
                              Read Only
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="px-3.5 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(sub)}
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-teal-50 text-slate-600 hover:text-[#00A389] border border-slate-200 hover:border-teal-200 transition-colors cursor-pointer"
                            title="Edit Sub-Provider & Permissions"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenPassword(sub)}
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-amber-700 border border-slate-200 hover:border-amber-200 transition-colors cursor-pointer"
                            title="Reset Password"
                          >
                            <KeyRound className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenDelete(sub)}
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer"
                            title="Delete Sub-Provider"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==================== MODAL 1: ADD SUB-PROVIDER ==================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-teal-50 text-[#00A389]">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add New Sub-Provider</h3>
                  <p className="text-xs text-slate-500">
                    Create credentials and assign access permissions.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    placeholder="e.g. David Miller"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A389]/20 focus:border-[#00A389]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={addPhone}
                    onChange={(e) => setAddPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A389]/20 focus:border-[#00A389]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address (Login Username) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    placeholder="e.g. david.sub@fitlife.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A389]/20 focus:border-[#00A389]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Temporary Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showAddPass ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={addPassword}
                      onChange={(e) => setAddPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A389]/20 focus:border-[#00A389]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAddPass(!showAddPass)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showAddPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Gym Access & Assignment */}
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <Building2 className="h-3.5 w-3.5 text-[#00A389]" />
                    <span>Assign to Gym(s)</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Control gym visibility
                  </span>
                </div>

                {/* Radio Options: All Gyms vs Specific Gyms */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div
                    onClick={() => setAddHasAllGyms(true)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start space-x-2.5 ${
                      addHasAllGyms
                        ? 'bg-teal-50/70 border-[#00A389] text-[#00A389] ring-1 ring-[#00A389]/30'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="addGymAccessMode"
                      checked={addHasAllGyms}
                      onChange={() => setAddHasAllGyms(true)}
                      className="mt-0.5 text-[#00A389] focus:ring-[#00A389]"
                    />
                    <div>
                      <span className="text-xs font-bold block text-slate-900">All Gyms</span>
                      <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                        Can see and manage all current and future gyms
                      </span>
                    </div>
                  </div>

                  <div
                    onClick={() => setAddHasAllGyms(false)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start space-x-2.5 ${
                      !addHasAllGyms
                        ? 'bg-teal-50/70 border-[#00A389] text-[#00A389] ring-1 ring-[#00A389]/30'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="addGymAccessMode"
                      checked={!addHasAllGyms}
                      onChange={() => setAddHasAllGyms(false)}
                      className="mt-0.5 text-[#00A389] focus:ring-[#00A389]"
                    />
                    <div>
                      <span className="text-xs font-bold block text-slate-900">Particular Gym(s)</span>
                      <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                        Restrict access to selected gym locations only
                      </span>
                    </div>
                  </div>
                </div>

                {/* Particular Gyms Checklist */}
                {!addHasAllGyms && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60 text-[11px]">
                      <span className="font-semibold text-slate-700">
                        Choose Gyms ({addSelectedGymIds.length} of {gyms.length} selected)
                      </span>
                      {gyms.length > 0 && (
                        <div className="space-x-2 font-semibold">
                          <button
                            type="button"
                            onClick={() =>
                              setAddSelectedGymIds(
                                gyms
                                  .map((g) => g._id || g.id)
                                  .filter((id): id is string => typeof id === 'string' && id.length > 0)
                              )
                            }
                            className="text-[#00A389] hover:underline cursor-pointer"
                          >
                            Select All
                          </button>
                          <span className="text-slate-300">•</span>
                          <button
                            type="button"
                            onClick={() => setAddSelectedGymIds([])}
                            className="text-slate-500 hover:underline cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>
                      )}
                    </div>

                    {gyms.length === 0 ? (
                      <p className="text-xs text-slate-400 py-2 italic text-center">
                        No gyms registered yet under your account.
                      </p>
                    ) : (
                      <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                        {gyms.map((gym) => {
                          const gId = gym._id || gym.id;
                          if (!gId) return null;
                          const isChecked = addSelectedGymIds.includes(gId);
                          return (
                            <label
                              key={gId}
                              className={`flex items-center space-x-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                                isChecked
                                  ? 'bg-teal-50/80 text-slate-900 border border-teal-200/80'
                                  : 'hover:bg-slate-100 text-slate-700 border border-transparent'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setAddSelectedGymIds((prev) => (prev.includes(gId) ? prev : [...prev, gId]));
                                  } else {
                                    setAddSelectedGymIds((prev) => prev.filter((id) => id !== gId));
                                  }
                                }}
                                className="rounded border-slate-300 text-[#00A389] focus:ring-[#00A389]"
                              />
                              <div className="flex-1 min-w-0">
                                <span className="text-xs font-semibold block truncate">
                                  {gym.gymName}
                                </span>
                                <span className="text-[10px] text-slate-400 block truncate">
                                  {gym.city || 'Bangalore'} • ₹{gym.dayPassPrice || 150} / day pass
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                    {addSelectedGymIds.length === 0 && (
                      <p className="text-[11px] text-amber-600 font-medium">
                        ⚠️ Please select at least one gym, or select "All Gyms".
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Permissions Checkboxes */}
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <label className="block text-xs font-bold text-slate-800">
                  Access Permissions & Limits
                </label>
                <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs">
                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addPermissions.canEditGym}
                      onChange={(e) =>
                        setAddPermissions((p) => ({ ...p, canEditGym: e.target.checked }))
                      }
                      className="rounded border-slate-300 text-[#00A389] focus:ring-[#00A389]"
                    />
                    <div>
                      <span className="font-bold text-slate-800">Can Edit Gyms</span>
                      <span className="text-slate-500 text-[11px] block">
                        Allow editing gym pricing, amenities, description, and hours.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addPermissions.canCreateGym}
                      onChange={(e) =>
                        setAddPermissions((p) => ({ ...p, canCreateGym: e.target.checked }))
                      }
                      className="rounded border-slate-300 text-[#00A389] focus:ring-[#00A389]"
                    />
                    <div>
                      <span className="font-bold text-slate-800">Can Create New Gyms</span>
                      <span className="text-slate-500 text-[11px] block">
                        Allow registering new gym locations under your account.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addPermissions.canViewLeads}
                      onChange={(e) =>
                        setAddPermissions((p) => ({ ...p, canViewLeads: e.target.checked }))
                      }
                      className="rounded border-slate-300 text-[#00A389] focus:ring-[#00A389]"
                    />
                    <div>
                      <span className="font-bold text-slate-800">Can View Customer Leads</span>
                      <span className="text-slate-500 text-[11px] block">
                        Allow viewing enquiries, customer contact info, and requested pass dates.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addPermissions.canManageLeads}
                      onChange={(e) =>
                        setAddPermissions((p) => ({ ...p, canManageLeads: e.target.checked }))
                      }
                      className="rounded border-slate-300 text-[#00A389] focus:ring-[#00A389]"
                    />
                    <div>
                      <span className="font-bold text-slate-800">Can Manage & Update Leads</span>
                      <span className="text-slate-500 text-[11px] block">
                        Allow updating status (Contacted, Closed) and adding follow-up notes.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2.5 bg-[#00A389] hover:bg-[#00917a] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {isCreating && <Loader2 className="h-4 w-4 animate-spin text-white" />}
                  <span>{isCreating ? 'Creating...' : 'Create Sub-Provider'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL 2: EDIT SUB-PROVIDER ==================== */}
      {isEditModalOpen && selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden animate-scaleUp">
            <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-teal-50 text-[#00A389]">
                  <Pencil className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Edit Sub-Provider: {selectedSub.name}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedSub.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A389]/20 focus:border-[#00A389]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A389]/20 focus:border-[#00A389]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Account Status
                  </label>
                  <select
                    value={editIsActive ? 'active' : 'inactive'}
                    onChange={(e) => setEditIsActive(e.target.value === 'active')}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A389]/20 focus:border-[#00A389]"
                  >
                    <option value="active">Active (Permitted to log in)</option>
                    <option value="inactive">Inactive (Deactivated)</option>
                  </select>
                </div>
              </div>

              {/* Gym Access & Assignment (Assign to: All gym vs particular gyms) */}
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <Building2 className="h-3.5 w-3.5 text-[#00A389]" />
                    <span>Assign to Gym(s)</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Control gym visibility
                  </span>
                </div>

                {/* Radio Options: All Gyms vs Particular Gym(s) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div
                    onClick={() => setEditHasAllGyms(true)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start space-x-2.5 ${
                      editHasAllGyms
                        ? 'bg-teal-50/70 border-[#00A389] text-[#00A389] ring-1 ring-[#00A389]/30'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="editGymAccessMode"
                      checked={editHasAllGyms}
                      onChange={() => setEditHasAllGyms(true)}
                      className="mt-0.5 text-[#00A389] focus:ring-[#00A389]"
                    />
                    <div>
                      <span className="text-xs font-bold block text-slate-900">All Gyms</span>
                      <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                        Can see and manage all current and future gyms
                      </span>
                    </div>
                  </div>

                  <div
                    onClick={() => setEditHasAllGyms(false)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start space-x-2.5 ${
                      !editHasAllGyms
                        ? 'bg-teal-50/70 border-[#00A389] text-[#00A389] ring-1 ring-[#00A389]/30'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="editGymAccessMode"
                      checked={!editHasAllGyms}
                      onChange={() => setEditHasAllGyms(false)}
                      className="mt-0.5 text-[#00A389] focus:ring-[#00A389]"
                    />
                    <div>
                      <span className="text-xs font-bold block text-slate-900">Particular Gym(s)</span>
                      <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                        Restrict access to selected gym locations only
                      </span>
                    </div>
                  </div>
                </div>

                {/* Particular Gyms Checklist */}
                {!editHasAllGyms && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60 text-[11px]">
                      <span className="font-semibold text-slate-700">
                        Choose Gyms ({editSelectedGymIds.length} of {gyms.length} selected)
                      </span>
                      {gyms.length > 0 && (
                        <div className="space-x-2 font-semibold">
                          <button
                            type="button"
                            onClick={() =>
                              setEditSelectedGymIds(
                                gyms
                                  .map((g) => g._id || g.id)
                                  .filter((id): id is string => typeof id === 'string' && id.length > 0)
                              )
                            }
                            className="text-[#00A389] hover:underline cursor-pointer"
                          >
                            Select All
                          </button>
                          <span className="text-slate-300">•</span>
                          <button
                            type="button"
                            onClick={() => setEditSelectedGymIds([])}
                            className="text-slate-500 hover:underline cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>
                      )}
                    </div>

                    {gyms.length === 0 ? (
                      <p className="text-xs text-slate-400 py-2 italic text-center">
                        No gyms registered yet under your account.
                      </p>
                    ) : (
                      <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                        {gyms.map((gym) => {
                          const gId = gym._id || gym.id;
                          if (!gId) return null;
                          const isChecked = editSelectedGymIds.includes(gId);
                          return (
                            <label
                              key={gId}
                              className={`flex items-center space-x-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                                isChecked
                                  ? 'bg-teal-50/80 text-slate-900 border border-teal-200/80'
                                  : 'hover:bg-slate-100 text-slate-700 border border-transparent'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setEditSelectedGymIds((prev) => (prev.includes(gId) ? prev : [...prev, gId]));
                                  } else {
                                    setEditSelectedGymIds((prev) => prev.filter((id) => id !== gId));
                                  }
                                }}
                                className="rounded border-slate-300 text-[#00A389] focus:ring-[#00A389]"
                              />
                              <div className="flex-1 min-w-0">
                                <span className="text-xs font-semibold block truncate">
                                  {gym.gymName}
                                </span>
                                <span className="text-[10px] text-slate-400 block truncate">
                                  {gym.city || 'Bangalore'} • ₹{gym.dayPassPrice || 150} / day pass
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                    {editSelectedGymIds.length === 0 && (
                      <p className="text-[11px] text-amber-600 font-medium">
                        ⚠️ Please select at least one gym, or select "All Gyms".
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Permissions Toggles */}
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <label className="block text-xs font-bold text-slate-800">
                  Access Permissions & Limits
                </label>
                <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs">
                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPermissions.canEditGym}
                      onChange={(e) =>
                        setEditPermissions((p) => ({ ...p, canEditGym: e.target.checked }))
                      }
                      className="rounded border-slate-300 text-[#00A389] focus:ring-[#00A389]"
                    />
                    <div>
                      <span className="font-bold text-slate-800">Can Edit Gyms</span>
                      <span className="text-slate-500 text-[11px] block">
                        Allow editing gym pricing, amenities, description, and hours.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPermissions.canCreateGym}
                      onChange={(e) =>
                        setEditPermissions((p) => ({ ...p, canCreateGym: e.target.checked }))
                      }
                      className="rounded border-slate-300 text-[#00A389] focus:ring-[#00A389]"
                    />
                    <div>
                      <span className="font-bold text-slate-800">Can Create New Gyms</span>
                      <span className="text-slate-500 text-[11px] block">
                        Allow registering new gym locations under your account.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPermissions.canViewLeads}
                      onChange={(e) =>
                        setEditPermissions((p) => ({ ...p, canViewLeads: e.target.checked }))
                      }
                      className="rounded border-slate-300 text-[#00A389] focus:ring-[#00A389]"
                    />
                    <div>
                      <span className="font-bold text-slate-800">Can View Customer Leads</span>
                      <span className="text-slate-500 text-[11px] block">
                        Allow viewing enquiries, customer contact info, and requested pass dates.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPermissions.canManageLeads}
                      onChange={(e) =>
                        setEditPermissions((p) => ({ ...p, canManageLeads: e.target.checked }))
                      }
                      className="rounded border-slate-300 text-[#00A389] focus:ring-[#00A389]"
                    />
                    <div>
                      <span className="font-bold text-slate-800">Can Manage & Update Leads</span>
                      <span className="text-slate-500 text-[11px] block">
                        Allow updating status (Contacted, Closed) and adding follow-up notes.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2.5 bg-[#00A389] hover:bg-[#00917a] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {isUpdating && <Loader2 className="h-4 w-4 animate-spin text-white" />}
                  <span>{isUpdating ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL 3: CHANGE PASSWORD ==================== */}
      {isPasswordModalOpen && selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden animate-scaleUp">
            <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Change Password</h3>
                  <p className="text-xs text-slate-500">For {selectedSub.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A389]/20 focus:border-[#00A389]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {isChangingPass && <Loader2 className="h-4 w-4 animate-spin text-white" />}
                  <span>{isChangingPass ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL 4: DELETE CONFIRMATION ==================== */}
      {isDeleteModalOpen && selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-scaleUp">
            <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="h-6 w-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Remove Sub-Provider?
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to remove <span className="font-bold text-slate-800">{selectedSub.name}</span> ({selectedSub.email})? They will immediately lose access to your provider portal.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center space-x-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Keep Account
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteSubmit}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />}
                <span>{isDeleting ? 'Removing...' : 'Yes, Remove Access'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
