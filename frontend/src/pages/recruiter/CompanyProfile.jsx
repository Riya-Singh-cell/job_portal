import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FiCamera, FiSave, FiHome } from 'react-icons/fi';
import { companiesAPI } from '../../services/api';
import { getMe } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';
import { INDUSTRY_LIST, EMPLOYEE_COUNT_OPTIONS } from '../../utils/constants';

const CompanyProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [company, setCompany] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const [form, setForm] = useState({
    name: '', description: '', website: '', location: '', industry: '', employeeCount: '',
  });

  useEffect(() => {
    if (user?.company) {
      const fetchCompany = async () => {
        try {
          const res = await companiesAPI.getOne(user.company._id || user.company);
          const c = res.data.data;
          setCompany(c);
          setForm({ name: c.name, description: c.description || '', website: c.website || '', location: c.location || '', industry: c.industry || '', employeeCount: c.employeeCount || '' });
        } catch {}
      };
      fetchCompany();
    } else {
      setIsCreating(true);
    }
  }, [user]);

  const handleSave = async () => {
    if (!form.name) return toast.error('Company name is required.');
    setLoading(true);
    try {
      if (isCreating) {
        await companiesAPI.create(form);
        await dispatch(getMe());
        toast.success('Company created!');
        setIsCreating(false);
      } else {
        const res = await companiesAPI.update(company._id, form);
        setCompany(res.data.data);
        toast.success('Company updated!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !company?._id) return;
    setLogoUploading(true);
    const formData = new FormData();
    formData.append('logo', file);
    try {
      const res = await companiesAPI.uploadLogo(company._id, formData);
      setCompany((prev) => ({ ...prev, logo: res.data.data.logo }));
      toast.success('Logo updated!');
    } catch {
      toast.error('Upload failed.');
    } finally {
      setLogoUploading(false);
    }
  };

  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {isCreating ? 'Create Company Profile' : 'Company Profile'}
        </h1>
        <button onClick={handleSave} disabled={loading} className="btn-primary gap-2">
          <FiSave className="w-4 h-4" />
          {loading ? 'Saving...' : isCreating ? 'Create Company' : 'Save Changes'}
        </button>
      </div>

      {/* Logo */}
      {!isCreating && company && (
        <div className="card p-6">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Company Logo</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700">
                {company.logo ? (
                  <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiHome className="w-8 h-8 text-slate-400" />
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700">
                {logoUploading ? (
                  <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FiCamera className="w-3.5 h-3.5 text-white" />
                )}
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">{company.name}</p>
              <p className="text-sm text-slate-500">{company.industry || 'No industry set'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-slate-900 dark:text-slate-100">Company Information</h2>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Company Name *</label>
          <input value={form.name} onChange={(e) => update('name', e.target.value)} className="input" placeholder="Acme Corporation" />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Description</label>
          <textarea rows={4} value={form.description} onChange={(e) => update('description', e.target.value)} className="input resize-none" placeholder="Tell candidates about your company..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Industry</label>
            <select value={form.industry} onChange={(e) => update('industry', e.target.value)} className="input">
              <option value="">Select industry</option>
              {INDUSTRY_LIST.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Company Size</label>
            <select value={form.employeeCount} onChange={(e) => update('employeeCount', e.target.value)} className="input">
              <option value="">Select size</option>
              {EMPLOYEE_COUNT_OPTIONS.map((o) => <option key={o} value={o}>{o} employees</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Location</label>
          <input value={form.location} onChange={(e) => update('location', e.target.value)} className="input" placeholder="San Francisco, CA" />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Website</label>
          <input type="url" value={form.website} onChange={(e) => update('website', e.target.value)} className="input" placeholder="https://yourcompany.com" />
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
