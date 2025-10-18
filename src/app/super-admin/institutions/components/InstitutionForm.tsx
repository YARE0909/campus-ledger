import React from 'react';

interface InstitutionFormData {
  name: string;
  contact_email: string;
  phone: string;
  address: string;
  subscription_tier_id: string; // string ID of subscription tier (ObjectId)
}

interface InstitutionFormProps {
  formData: InstitutionFormData;
  setFormData: (data: InstitutionFormData) => void;
  subscriptionTiers: { id: string; name: string }[];
}

export default function InstitutionForm({
  formData,
  setFormData,
  subscriptionTiers,
}: InstitutionFormProps) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Institution Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
        <input
          type="email"
          value={formData.contact_email}
          onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
        <textarea
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Subscription Tier</label>
        <select
          value={formData.subscription_tier_id}
          onChange={(e) => setFormData({ ...formData, subscription_tier_id: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        >
          <option value="">Select a tier</option>
          {subscriptionTiers.map((tier) => (
            <option key={tier.id} value={tier.id}>
              {tier.name}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
