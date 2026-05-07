import React from 'react';

const TabButton = ({ label, isActive, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-4 py-2 rounded-t-lg transition-colors font-medium text-sm whitespace-nowrap ${
      isActive
        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
        : 'bg-[#0B1020] text-slate-300 hover:bg-purple-500/10'
    }`}
  >
    {label}
  </button>
);

const UploadTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex mb-4 border-b border-white/10">
      <TabButton
        label="Upload File"
        isActive={activeTab === 'file'}
        onClick={() => setActiveTab('file')}
      />
      <TabButton
        label="Paste Text"
        isActive={activeTab === 'text'}
        onClick={() => setActiveTab('text')}
      />
    </div>
  );
};

export default UploadTabs;
