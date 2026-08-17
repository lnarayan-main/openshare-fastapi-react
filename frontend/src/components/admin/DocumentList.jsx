// components/admin/DocumentList.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';

export default function DocumentList() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await adminAPI.getDocuments(100, 0);
      setDocuments(res.data.documents);
    } catch (err) {
      setError('Failed to load documents.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await adminAPI.deleteDocument(id);
      setDocuments(docs => docs.filter(d => d.id !== id));
    } catch (err) {
      alert('Delete failed.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Documents</h2>
        <Link to="/admin/documents/new" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
          + Add Document
        </Link>
      </div>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {documents.map(doc => (
            <li key={doc.id} className="px-6 py-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {doc.payload.title || doc.payload.text?.substring(0, 50) + '...'}
                </div>
                <div className="text-sm text-gray-500">
                  {doc.payload.category || 'No category'}
                </div>
              </div>
              <div className="flex space-x-2">
                <Link to={`/admin/documents/edit/${doc.id}`} className="text-indigo-600 hover:text-indigo-900">Edit</Link>
                <button onClick={() => handleDelete(doc.id)} className="text-red-600 hover:text-red-900">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}