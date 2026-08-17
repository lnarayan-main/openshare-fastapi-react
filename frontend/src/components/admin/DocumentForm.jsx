// components/admin/DocumentForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminAPI } from '../../services/api';

export default function DocumentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    text: '',
    metadata: {
      title: '',
      category: '',
      tags: '',
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) {
      adminAPI.getDocument(id)
        .then(res => {
          const doc = res.data;
          setFormData({
            text: doc.payload.text || '',
            metadata: {
              title: doc.payload.title || '',
              category: doc.payload.category || '',
              tags: doc.payload.tags || '',
            }
          });
        })
        .catch(() => setError('Failed to load document'));
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('meta.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        metadata: { ...prev.metadata, [key]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        text: formData.text,
        metadata: formData.metadata
      };
      if (isEditing) {
        await adminAPI.updateDocument(id, payload);
      } else {
        await adminAPI.createDocument(payload);
      }
      navigate('/admin/documents');
    } catch (err) {
      setError('Operation failed.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">{isEditing ? 'Edit Document' : 'New Document'}</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            name="meta.title"
            value={formData.metadata.title}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="Document title"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Content (main text)</label>
          <textarea
            name="text"
            value={formData.text}
            onChange={handleChange}
            rows="6"
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="Type the document content here..."
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <input
            name="meta.category"
            value={formData.metadata.category}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="e.g., Technology, Travel, Food"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
          <input
            name="meta.tags"
            value={formData.metadata.tags}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="e.g., AI, trends, culture"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => navigate('/admin/documents')}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}