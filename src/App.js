import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import Webcam from "react-webcam";
import axios from "axios";

const API_KEY = "AIzaSyAxugYSpGlpxE-BydbfYD5iuRKAAYsKZNY"; // Replace with your YouTube API Key

const App = () => {
  const webcamRef = useRef(null);
  const [emotion, setEmotion] = useState("Detecting...");
  const [playlist, setPlaylist] = useState([]);

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceExpressionNet.loadFromUri("/models");
    };
    loadModels();
  }, []);

  const detectEmotion = async () => {
    if (webcamRef.current) {
      const video = webcamRef.current.video;
      if (!video) return;

      const detections = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detections) {
        const expressions = detections.expressions;
        const mood = Object.keys(expressions).reduce((a, b) =>
          expressions[a] > expressions[b] ? a : b
        );
        setEmotion(mood);
        fetchPlaylist(mood);
      }
    }
  };

  const fetchPlaylist = async (mood) => {
    let query;
    switch (mood) {
      case "happy":
        query = "Happy songs playlist";
        break;
      case "sad":
        query = "Sad songs playlist";
        break;
      case "angry":
        query = "Rock music playlist";
        break;
      case "neutral":
        query = "Chill music playlist";
        break;
      default:
        query = "Top music playlist";
    }

    try {
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=playlist&q=${query}&key=${API_KEY}`
      );

      if (response.data.items.length > 0) {
        setPlaylist(response.data.items);
      }
    } catch (error) {
      console.error("Error fetching playlist:", error);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Mood-Based YouTube Music Playlist</h1>
      <Webcam ref={webcamRef} width="400" height="300" />
      <button onClick={detectEmotion}>Detect Mood</button>
      <h2>Your Mood: {emotion}</h2>

      <h3>Recommended Playlist:</h3>
      <ul>
        {playlist.map((item) => (
          <li key={item.id.playlistId}>
            <a
              href={`https://www.youtube.com/playlist?list=${item.id.playlistId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.snippet.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;