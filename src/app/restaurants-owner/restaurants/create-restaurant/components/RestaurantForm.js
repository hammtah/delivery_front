'use client';

const RestaurantForm = ({ formData, setFormData, addressDetails, onSubmit }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block mb-1">Restaurant Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block mb-1">Image URL</label>
        <input
          type="url"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      {addressDetails && (
        <div className="border p-4 rounded">
          <h3 className="font-bold mb-2">Address Details</h3>
          <p>Street: {addressDetails.street}</p>
          <p>City: {addressDetails.city}</p>
          <p>Province: {addressDetails.province}</p>
          <p>Postal Code: {addressDetails.postal_code}</p>
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
      >
        Create Restaurant
      </button>
    </form>
  );
};

export default RestaurantForm; 