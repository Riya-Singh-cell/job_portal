import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiCamera, FiUpload, FiPlus, FiTrash2, FiEdit2, FiSave, FiLink } from 'react-icons/fi';
import { updateProfile } from '../../redux/slices/authSlice';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { SKILLS_LIST } from '../../utils/constants';

const CandidateProfile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({ avatar: false, resume: false });
  const [newSkill, setNewSkill] = useState('');

  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.profile?.bio || '',
    skills: user?.profile?.skills || [],
    experience: user?.profile?.experience || [],
    education: user?.profile?.education || [],
    certifications: user?.profile?.certifications || [],
    socialLinks: user?.profile?.socialLinks || [],
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await dispatch(updateProfile({ name: form.name, profile: { ...form } })).unwrap();
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading((p) => ({ ...p, avatar: true }));
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      await authAPI.uploadAvatar(formData);
      toast.success('Avatar updated!');
      window.location.reload();
    } catch {
      toast.error('Upload failed.');
    } finally {
      setUploading((p) => ({ ...p, avatar: false }));
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading((p) => ({ ...p, resume: true }));
    const formData = new FormData();
    formData.append('resume', file);
    try {
      await authAPI.uploadResume(formData);
      toast.success('Resume uploaded!');
    } catch {
      toast.error('Upload failed. Must be PDF.');
    } finally {
      setUploading((p) => ({ ...p, resume: false }));
    }
  };

  const addSkill = () => {
    const skill = newSkill.trim();
    if (skill && !form.skills.includes(skill)) {
      setForm((p) => ({ ...p, skills: [...p.skills, skill] }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => setForm((p) => ({ ...p, skills: p.skills.filter((s) => s !== skill) }));

  const addExperience = () => {
    setForm((p) => ({
      ...p,
      experience: [...p.experience, { title: '', company: '', location: '', from: '', to: '', current: false, description: '' }],
    }));
  };

  const updateExperience = (i, field, value) => {
    const updated = [...form.experience];
    updated[i] = { ...updated[i], [field]: value };
    setForm((p) => ({ ...p, experience: updated }));
  };

  const removeExperience = (i) => setForm((p) => ({ ...p, experience: p.experience.filter((_, idx) => idx !== i) }));

  const addEducation = () => {
    setForm((p) => ({
      ...p,
      education: [...p.education, { school: '', degree: '', fieldOfStudy: '', from: '', to: '', current: false }],
    }));
  };

  const updateEducation = (i, field, value) => {
    const updated = [...form.education];
    updated[i] = { ...updated[i], [field]: value };
    setForm((p) => ({ ...p, education: updated }));
  };

  const removeEducation = (i) => setForm((p) => ({ ...p, education: p.education.filter((_, idx) => idx !== i) }));

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">My Profile</h1>
        <button onClick={handleSave} disabled={saving} className="btn-primary gap-2">
          <FiSave className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Avatar + Basic Info */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Basic Information</h2>
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-primary-100 dark:bg-primary-900/30 overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-primary-600">
                  {user?.name?.[0]}
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors">
              {uploading.avatar ? (
                <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FiCamera className="w-3.5 h-3.5 text-white" />
              )}
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Full Name</label>
              <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Bio</label>
              <textarea
                rows={3}
                value={form.bio}
                onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                placeholder="Tell recruiters about yourself..."
                className="input resize-none"
              />
            </div>
          </div>
        </div>

        {/* Resume upload */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
          <label className="text-xs font-medium text-slate-500 mb-2 block">Resume (PDF)</label>
          <div className="flex items-center gap-3">
            {user?.profile?.resume ? (
              <a
                href={user.profile.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-600 hover:underline flex items-center gap-1"
              >
                <FiLink className="w-3.5 h-3.5" />
                {user.profile.resumeOriginalName || 'View Resume'}
              </a>
            ) : (
              <span className="text-sm text-slate-400">No resume uploaded</span>
            )}
            <label className="btn-outline text-xs py-1.5 px-3 cursor-pointer gap-1.5">
              {uploading.resume ? 'Uploading...' : <><FiUpload className="w-3.5 h-3.5" /> Upload Resume</>}
              <input type="file" accept=".pdf" onChange={handleResumeUpload} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Skills</h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {form.skills.map((skill) => (
            <span key={skill} className="flex items-center gap-1 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-lg text-sm font-medium">
              {skill}
              <button onClick={() => removeSkill(skill)} className="text-primary-400 hover:text-primary-700 ml-0.5">
                <FiTrash2 className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            list="skills-list"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addSkill()}
            placeholder="Add skill..."
            className="input flex-1 text-sm py-2"
          />
          <datalist id="skills-list">
            {SKILLS_LIST.map((s) => <option key={s} value={s} />)}
          </datalist>
          <button onClick={addSkill} className="btn-primary py-2 px-4">
            <FiPlus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Experience */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">Experience</h2>
          <button onClick={addExperience} className="btn-outline text-xs py-1.5 px-3 gap-1">
            <FiPlus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
        <div className="space-y-4">
          {form.experience.map((exp, i) => (
            <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Job Title</label>
                  <input value={exp.title} onChange={(e) => updateExperience(i, 'title', e.target.value)} className="input text-sm py-2" placeholder="Software Engineer" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Company</label>
                  <input value={exp.company} onChange={(e) => updateExperience(i, 'company', e.target.value)} className="input text-sm py-2" placeholder="Acme Corp" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Start Date</label>
                  <input type="date" value={exp.from?.split?.('T')[0] || ''} onChange={(e) => updateExperience(i, 'from', e.target.value)} className="input text-sm py-2" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">End Date</label>
                  <input type="date" value={exp.to?.split?.('T')[0] || ''} onChange={(e) => updateExperience(i, 'to', e.target.value)} disabled={exp.current} className="input text-sm py-2 disabled:opacity-50" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <input type="checkbox" checked={exp.current} onChange={(e) => updateExperience(i, 'current', e.target.checked)} className="rounded" />
                Currently working here
              </label>
              <textarea rows={2} value={exp.description} onChange={(e) => updateExperience(i, 'description', e.target.value)} placeholder="Describe your responsibilities..." className="input text-sm resize-none" />
              <button onClick={() => removeExperience(i)} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                <FiTrash2 className="w-3 h-3" /> Remove
              </button>
            </div>
          ))}
          {form.experience.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">No experience added yet.</p>
          )}
        </div>
      </div>

      {/* Education */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">Education</h2>
          <button onClick={addEducation} className="btn-outline text-xs py-1.5 px-3 gap-1">
            <FiPlus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
        <div className="space-y-4">
          {form.education.map((edu, i) => (
            <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">School</label>
                  <input value={edu.school} onChange={(e) => updateEducation(i, 'school', e.target.value)} className="input text-sm py-2" placeholder="University of..." />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Degree</label>
                  <input value={edu.degree} onChange={(e) => updateEducation(i, 'degree', e.target.value)} className="input text-sm py-2" placeholder="B.Sc." />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Field of Study</label>
                  <input value={edu.fieldOfStudy} onChange={(e) => updateEducation(i, 'fieldOfStudy', e.target.value)} className="input text-sm py-2" placeholder="Computer Science" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Graduation Year</label>
                  <input type="date" value={edu.to?.split?.('T')[0] || ''} onChange={(e) => updateEducation(i, 'to', e.target.value)} className="input text-sm py-2" />
                </div>
              </div>
              <button onClick={() => removeEducation(i)} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                <FiTrash2 className="w-3 h-3" /> Remove
              </button>
            </div>
          ))}
          {form.education.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">No education added yet.</p>
          )}
        </div>
      </div>

      {/* Save button bottom */}
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary gap-2">
          <FiSave className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
};

export default CandidateProfile;
