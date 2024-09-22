import React, { useState } from 'react';
import { useFirebase } from '../context/Firebase'; // Adjust the path as needed

const FileUpload = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [url, setUrl] = useState('');
    const { uploadPDFToFirebase } = useFirebase(); // Get the upload function from context

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);

        try {
            const fileURL = await uploadPDFToFirebase(file); // Use the context method
            setUrl(fileURL);
            alert('File uploaded successfully!');
        } catch (error) {
            console.error("Error uploading file:", error);
            alert('Error uploading file');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <h2>Upload </h2>
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
            <button onClick={handleUpload} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload Resume'}
            </button>
            {url && <p>File URL: <a href={url} target="_blank" rel="noopener noreferrer">{url}</a></p>}
        </div>
    );
};

export default FileUpload;
