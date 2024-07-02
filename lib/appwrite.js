import { Alert } from "react-native";
import {
  Account,
  Avatars,
  Client,
  Databases,
  Storage,
  ID,
  Query,
} from "react-native-appwrite";

export const config = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.techtron.aora",
  projectId: "661d3647c1e8ad7c2884",
  databaseId: "661d374133830bb438e4",
  userCollectionId: "661d37696016c72c7da1",
  videoCollectionId: "661d379a2462e1179cff",
  storageId: "661d39831af6484e1062",
};

// Init your react-native SDK
const client = new Client();

client
  .setEndpoint(config.endpoint) // Your Appwrite Endpoint
  .setProject(config.projectId) // Your project ID
  .setPlatform(config.platform); // Your application ID or bundle ID.

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

export const createUser = async (email, password, username) => {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(username);

    await signIn(email, password);

    const newUser = await databases.createDocument(
      config.databaseId,
      config.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email,
        username,
        avatar: avatarUrl,
      }
    );

    return newUser;
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

export const signIn = async (email, password) => {
  try {
    const session = await account.createEmailSession(email, password);
    return session;
  } catch (err) {
    throw new Error(err);
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();

    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      config.databaseId,
      config.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
  }
};

export const getAllPosts = async () => {
  try {
    const posts = await databases.listDocuments(
      config.databaseId,
      config.videoCollectionId,
      [Query.orderDesc("$createdAt")]
    );

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
};

export const getLatestPosts = async () => {
  try {
    const posts = await databases.listDocuments(
      config.databaseId,
      config.videoCollectionId,
      [Query.orderDesc("$createdAt", Query.limit(7))]
    );

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
};

export const searchPosts = async (query) => {
  try {
    const posts = await databases.listDocuments(
      config.databaseId,
      config.videoCollectionId,
      [Query.search("title", query)]
    );

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
};

export const getUserPosts = async (userId) => {
  try {
    const posts = await databases.listDocuments(
      config.databaseId,
      config.videoCollectionId,
      [Query.equal("creator", userId)]
    );

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
};

export const signOut = async () => {
  try {
    const session = await account.deleteSession("current");
    return session;
  } catch (error) {
    throw new Error(error);
  }
};

export const getFilePreview = async (fileId, type) => {
  let fileUrl;

  try {
    if (type === "video") {
      fileUrl = storage.getFileView(config.storageId, fileId);
    } else if (type === "image") {
      fileUrl = storage.getFilePreview(
        config.storageId,
        fileId,
        2000,
        2000,
        "top",
        100
      );
    } else {
      throw new Error("invalid File Type");
    }

    if (!fileUrl) throw Error;

    return fileUrl;
  } catch (error) {
    throw new Error(error);
  }
};

export const uploadFile = async (file, type) => {
  if (!file) return;

  const { mimeType, ...rest } = file;
  const asset = { type: mimeType, ...rest };

  try {
    const uploadedFile = await storage.createFile(
      config.storageId,
      ID.unique(),
      asset
    );

    const fileUrl = await getFilePreview(uploadedFile.$id, type);

    return fileUrl;
  } catch (error) {
    throw new Error(error);
  }
};

export const createVideo = async (form) => {
  try {
    const [thumbnailUrl, videoUrl] = await Promise.all([
      uploadFile(form.thumbnail, "image"),
      uploadFile(form.video, "video"),
    ]);

    const newPost = await databases.createDocument(
      config.databaseId,
      config.videoCollectionId,
      ID.unique(),
      {
        title: form.title,
        thumbnail: thumbnailUrl,
        video: videoUrl,
        prompt: form.prompt,
        creator: form.userId,
      }
    );

    return newPost;
  } catch (error) {
    throw new Error(error);
  }
};

export const addToSaved = async (userId, videoId) => {
  try {
    // Fetch current document
    const getCurrentVideo = await databases.getDocument(
      config.databaseId,
      config.videoCollectionId,
      videoId
    );

    // Check if the document exists
    if (!getCurrentVideo) {
      throw new Error("Video not found");
    }

    // Update the document by adding the userId to the 'savedBy' array
    const savedByUpdated = new Set(getCurrentVideo.savedBy || []);
    if (!savedByUpdated.has(userId)) {
      savedByUpdated.add(userId);

      // Update the document with the new savedBy array
      const updateResponse = await databases.updateDocument(
        config.databaseId,
        config.videoCollectionId,
        videoId,
        { savedBy: Array.from(savedByUpdated) }
      );

      if (updateResponse) {
        return Alert.alert("Success", "Added to Saved Collection");
      } else {
        throw new Error("Update failed");
      }
    } else {
      return Alert.alert(
        "Already added",
        "This video is already in your Saved Collection"
      );
    }
  } catch (error) {
    console.log(error);
    Alert.alert("Error", error.message || "An error occurred");
  }
};

export const removeFromSaved = async (userId, videoId) => {
  try {
    // Fetch the current video document by ID
    const currentVideo = await databases.getDocument(
      config.databaseId,
      config.videoCollectionId,
      videoId
    );

    // Check if the document exists
    if (!currentVideo) {
      throw new Error("Video not found");
    }

    // Check if userId exists in the savedBy array, then remove it
    if (currentVideo.savedBy && currentVideo.savedBy.includes(userId)) {
      const updatedSavedBy = currentVideo.savedBy.filter((id) => id !== userId);

      // Update the document with the new savedBy array
      const updateResponse = await databases.updateDocument(
        config.databaseId,
        config.videoCollectionId,
        videoId,
        { savedBy: updatedSavedBy }
      );

      if (updateResponse) {
        return Alert.alert("Success", "Removed from Saved Collection");
      } else {
        throw new Error("Update failed");
      }
    } else {
      return Alert.alert(
        "Not found",
        "User ID not found in the Saved Collection"
      );
    }
  } catch (error) {
    console.log(error);
    Alert.alert(
      "Error",
      error.message || "An error occurred while removing the video from saved"
    );
  }
};

export const getUserSavedPosts = async (userId) => {
  try {
    const posts = await databases.listDocuments(
      config.databaseId,
      config.videoCollectionId,
      [Query.orderDesc("$createdAt")]
    );
    const filteredPost = posts.documents.filter(
      (doc) => doc.savedBy && doc.savedBy.includes(userId)
    );
    return filteredPost;
  } catch (error) {
    throw new Error(error);
  }
};
