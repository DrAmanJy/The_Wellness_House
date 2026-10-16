'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Play, 
  Eye, 
  BarChart2, 
  Filter, 
  Check, 
  X, 
  ArrowLeft, 
  Lock, 
  Film,
  Sparkles,
  Search
} from 'lucide-react';
import { VideoItem, VideoPlacement, VideoAspectRatio } from '@/lib/video/types';
import { getStoredVideos, saveStoredVideos } from '@/lib/video/video-store';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { VideoModal } from '@/components/video/VideoModal';

export const VideoLibrary: React.FC = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [selectedPlacement, setSelectedPlacement] = useState<string>('all');
  const [previewVideo, setPreviewVideo] = useState<VideoItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [formData, setFormData] = useState<Partial<VideoItem>>({
    title: '',
    subtitle: '',
    description: '',
    videoUrl: '',
    posterUrl: '',
    placement: 'shop-the-film',
    aspectRatio: '16:9',
    linkedProductSlug: '',
    linkedProductTitle: '',
    linkedProductPrice: '',
    ctaLabel: 'Shop This Product',
    ctaUrl: '',
    duration: '0:30',
    isActive: true,
    sortOrder: 1,
  });

  useEffect(() => {
    setVideos(getStoredVideos());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.videoUrl || !formData.posterUrl) {
      alert('Please provide title, video URL, and poster URL.');
      return;
    }

    let updatedList: VideoItem[];

    if (editingId) {
      updatedList = videos.map((v) =>
        v.id === editingId
          ? ({
              ...v,
              ...formData,
              updatedAt: new Date().toISOString(),
            } as VideoItem)
          : v
      );
    } else {
      const newVideo: VideoItem = {
        id: `vid-${Date.now()}`,
        title: formData.title || '',
        subtitle: formData.subtitle || '',
        description: formData.description || '',
        videoUrl: formData.videoUrl || '',
        posterUrl: formData.posterUrl || '',
        placement: (formData.placement as VideoPlacement) || 'shop-the-film',
        aspectRatio: (formData.aspectRatio as VideoAspectRatio) || '16:9',
        linkedProductSlug: formData.linkedProductSlug || '',
        linkedProductTitle: formData.linkedProductTitle || '',
        linkedProductPrice: formData.linkedProductPrice || '',
        ctaLabel: formData.ctaLabel || 'Shop This Product',
        ctaUrl: formData.ctaUrl || '',
        duration: formData.duration || '0:30',
        isActive: formData.isActive ?? true,
        sortOrder: Number(formData.sortOrder) || videos.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updatedList = [newVideo, ...videos];
    }

    setVideos(updatedList);
    saveStoredVideos(updatedList);
    resetForm();
  };

  const handleEdit = (video: VideoItem) => {
    setEditingId(video.id);
    setFormData(video);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this promotional video?')) {
      const updatedList = videos.filter((v) => v.id !== id);
      setVideos(updatedList);
      saveStoredVideos(updatedList);
    }
  };

  const handleToggleActive = (id: string) => {
    const updatedList = videos.map((v) =>
      v.id === id ? { ...v, isActive: !v.isActive, updatedAt: new Date().toISOString() } : v
    );
    setVideos(updatedList);
    saveStoredVideos(updatedList);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      videoUrl: '',
      posterUrl: '',
      placement: 'shop-the-film',
      aspectRatio: '16:9',
      linkedProductSlug: '',
      linkedProductTitle: '',
      linkedProductPrice: '',
      ctaLabel: 'Shop This Product',
      ctaUrl: '',
      duration: '0:30',
      isActive: true,
      sortOrder: 1,
    });
    setIsFormOpen(false);
  };

  const filtered = videos.filter((v) => {
    if (selectedPlacement !== 'all' && v.placement !== selectedPlacement) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        (v.linkedProductTitle && v.linkedProductTitle.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#30473B]/10">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#30473B]">
            Commercial Content CMS
          </span>
          <h1 className="font-serif text-3xl text-[#252A25] font-normal mt-1">
            Video Advertising & Reels Management
          </h1>
          <p className="text-xs text-[#71776F] mt-1">
            Manage brand films, vertical shoppable reels, and product detail video advertisements.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsFormOpen(true);
          }}
          className="px-5 py-2.5 bg-[#30473B] text-[#FAF7F2] text-xs font-medium uppercase tracking-wider rounded-xl hover:bg-[#203128] transition-all flex items-center gap-2 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Promotional Video</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FFFEFA] p-4 rounded-2xl border border-[#30473B]/10 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Placement tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Placements' },
            { id: 'category-film', label: 'Category Films' },
            { id: 'homepage-brand-film', label: 'Brand Film' },
            { id: 'shop-the-film', label: 'Shop The Film' },
            { id: 'shoppable-reels', label: 'Shoppable Reels' },
            { id: 'editorial-story', label: 'Editorial Story' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedPlacement(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedPlacement === tab.id
                  ? 'bg-[#30473B] text-[#FAF7F2]'
                  : 'bg-[#FAF7F2] text-[#252A25] hover:bg-[#CAD6BC]/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-[#71776F] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search videos..."
            className="w-full pl-8 pr-3 py-1.5 bg-[#FAF7F2] rounded-lg border border-[#30473B]/10 text-xs text-[#252A25] focus:outline-hidden focus:border-[#30473B]"
          />
        </div>
      </div>

      {/* Video Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={resetForm} />

          <div className="relative w-full max-w-2xl bg-[#FFFEFA] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#30473B]/15 z-10 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#30473B]/10">
              <h2 className="font-serif text-2xl text-[#252A25]">
                {editingId ? 'Edit Video Advertisement' : 'Add New Video Advertisement'}
              </h2>
              <button onClick={resetForm} className="p-1 text-[#71776F] hover:text-[#252A25]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase text-[#30473B] block mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#30473B]/15 rounded-lg text-xs"
                    placeholder="e.g. Metabolic Balance Ceremony"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-[#30473B] block mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={formData.subtitle || ''}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#30473B]/15 rounded-lg text-xs"
                    placeholder="e.g. Standardized 60% HCA Garcinia"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase text-[#30473B] block mb-1">Placement *</label>
                  <select
                    value={formData.placement || 'shop-the-film'}
                    onChange={(e) => setFormData({ ...formData, placement: e.target.value as VideoPlacement })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#30473B]/15 rounded-lg text-xs"
                  >
                    <option value="category-film">Category Film (Cinematic 2.4:1 Collection Banner)</option>
                    <option value="homepage-brand-film">Homepage Brand Film (16:9 Full Bleed)</option>
                    <option value="shop-the-film">Shop The Film (16:9 Product Video)</option>
                    <option value="shoppable-reels">Shoppable Reels (9:16 Vertical)</option>
                    <option value="editorial-story">Editorial Story (Split Screen)</option>
                    <option value="product-gallery">Product Detail Gallery</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-[#30473B] block mb-1">Aspect Ratio</label>
                  <select
                    value={formData.aspectRatio || '16:9'}
                    onChange={(e) => setFormData({ ...formData, aspectRatio: e.target.value as VideoAspectRatio })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#30473B]/15 rounded-lg text-xs"
                  >
                    <option value="16:9">16:9 Standard Wide</option>
                    <option value="9:16">9:16 Vertical Reel</option>
                    <option value="4:3">4:3 Product Gallery</option>
                    <option value="1:1">1:1 Square</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-[#30473B] block mb-1">Video Stream/MP4 URL *</label>
                <input
                  type="url"
                  required
                  value={formData.videoUrl || ''}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#30473B]/15 rounded-lg text-xs"
                  placeholder="https://.../video.mp4"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-[#30473B] block mb-1">Poster Image URL *</label>
                <input
                  type="url"
                  required
                  value={formData.posterUrl || ''}
                  onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#30473B]/15 rounded-lg text-xs"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-[#30473B] block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#30473B]/15 rounded-lg text-xs"
                  placeholder="Editorial summary of the advertisement and ingredients shown..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase text-[#30473B] block mb-1">Linked Product Slug</label>
                  <input
                    type="text"
                    value={formData.linkedProductSlug || ''}
                    onChange={(e) => setFormData({ ...formData, linkedProductSlug: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#30473B]/15 rounded-lg text-xs"
                    placeholder="metabolic-balance-protocol"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-[#30473B] block mb-1">Linked Product Title</label>
                  <input
                    type="text"
                    value={formData.linkedProductTitle || ''}
                    onChange={(e) => setFormData({ ...formData, linkedProductTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#30473B]/15 rounded-lg text-xs"
                    placeholder="Metabolic Balance Protocol"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-[#30473B] block mb-1">CTA Label</label>
                  <input
                    type="text"
                    value={formData.ctaLabel || ''}
                    onChange={(e) => setFormData({ ...formData, ctaLabel: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#30473B]/15 rounded-lg text-xs"
                    placeholder="Shop This Protocol"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#30473B]/10">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-xs font-medium uppercase text-[#71776F] hover:text-[#252A25]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#30473B] text-[#FAF7F2] text-xs font-medium uppercase tracking-wider rounded-lg hover:bg-[#203128]"
                >
                  {editingId ? 'Save Changes' : 'Create Video Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Videos List */}
      <div className="bg-[#FFFEFA] rounded-3xl border border-[#30473B]/10 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] border-b border-[#30473B]/10 font-mono uppercase text-[#30473B]">
              <tr>
                <th className="py-3 px-4">Preview</th>
                <th className="py-3 px-4">Title & Description</th>
                <th className="py-3 px-4">Placement</th>
                <th className="py-3 px-4">Product Link</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30473B]/05 text-[#252A25]">
              {filtered.map((video) => (
                <tr key={video.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                  <td className="py-3 px-4">
                    <button
                      onClick={() => setPreviewVideo(video)}
                      className="relative w-16 aspect-16/9 rounded-lg overflow-hidden bg-black group block border border-[#30473B]/10"
                      title="Preview video"
                    >
                      <img
                        src={video.posterUrl}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-3.5 h-3.5 text-white fill-current" />
                      </div>
                    </button>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-serif text-sm font-medium block">{video.title}</span>
                    <span className="text-[11px] text-[#71776F] line-clamp-1">{video.description}</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-mono text-[10px] uppercase bg-[#CAD6BC]/40 text-[#30473B] px-2 py-0.5 rounded-sm">
                      {video.placement}
                    </span>
                    <span className="font-mono text-[10px] text-[#71776F] block mt-0.5">
                      {video.aspectRatio} · {video.duration}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    {video.linkedProductTitle ? (
                      <span className="font-mono text-[11px] text-[#30473B]">
                        {video.linkedProductTitle}
                      </span>
                    ) : (
                      <span className="text-[#71776F] italic">None</span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleActive(video.id)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold ${
                        video.isActive
                          ? 'bg-[#30473B]/15 text-[#30473B]'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {video.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => setPreviewVideo(video)}
                        className="p-1.5 rounded-lg text-[#71776F] hover:text-[#30473B] hover:bg-[#FAF7F2]"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(video)}
                        className="p-1.5 rounded-lg text-[#71776F] hover:text-[#30473B] hover:bg-[#FAF7F2]"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(video.id)}
                        className="p-1.5 rounded-lg text-[#71776F] hover:text-red-600 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Video Modal Preview */}
      <VideoModal
        video={previewVideo}
        isOpen={!!previewVideo}
        onClose={() => setPreviewVideo(null)}
      />
    </div>
  );
};
