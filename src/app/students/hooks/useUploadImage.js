// hooks/useUploadImage.js
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../../libs/axios/firebaseConfig";
import { useState } from "react";

const useUploadImage = () => {
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const uploadImage = async (file) => {
    if (!file) return null;

    const isValidType = ["image/jpeg", "image/png", "image/jpg"].includes(file.type);
    if (!isValidType) {
      setError("Only JPEG, PNG, and JPG images are allowed.");
      return null;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB.");
      return null;
    }

    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const storageRef = ref(storage, `student-photos/${fileName}`);

    setUploading(true);
    setError(null);

    try {
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      setImageUrl(url);
      return url;
    } catch (err) {
      console.error("Firebase upload error:", err);
      setError("Upload failed. Check your connection and try again.");
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploading, imageUrl, error, uploadImage, setImageUrl };
};

export default useUploadImage;