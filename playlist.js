const ytpl = require('ytpl'); // Fetch playlists
const youtubedl = require('youtube-dl-exec'); // Download videos/audio with yt-dlp
const path = require('path');

// Function to download a single video as MP3
const downloadAsMp3 = (videoUrl, title, outputPath) => {
  return new Promise((resolve, reject) => {
    console.log(`Starting download: ${title}`);

    // Using yt-dlp directly without args array
    youtubedl(videoUrl, {
      extractAudio: true,  // Extract audio only
      audioFormat: 'mp3',  // Convert to mp3
      output: outputPath,  // Save the file with the sanitized title
      progress: true,      // Show download progress
      noCacheDir: true,    // Disable cache
      noPlaylist: true,    // Ensure it's downloading only the single video
    })
      .then(() => {
        console.log(`Finished downloading: ${title}`);
        resolve();
      })
      .catch((err) => {
        console.error(`Error with ${title}: ${err.message}`);
        reject(err);
      });
  });
};

// Function to process the entire playlist
const downloadPlaylist = async (playlistUrl) => {
  try {
    console.log('Fetching playlist...');
    const playlist = await ytpl(playlistUrl, { limit: Infinity });
    console.log(`Found ${playlist.items.length} videos. Starting download...`);

    // Step 1: Fetch all the video URLs and titles from the playlist
    const downloadTasks = playlist.items.map((item) => {
      const sanitizedTitle = item.title.replace(/[<>:"/\\|?*]+/g, ''); // Clean title for file system
      const outputPath = path.resolve(__dirname, `${sanitizedTitle}.mp3`); // Save MP3 in the current folder
      return downloadAsMp3(item.url, item.title, outputPath);
    });

    // Step 2: Wait for all download tasks to complete in parallel
    await Promise.all(downloadTasks);

    console.log('All downloads complete!');
  } catch (error) {
    console.error('Error processing playlist:', error.message);
  }
};

// Replace with your YouTube playlist URL
const PLAYLIST_URL =
  'https://www.youtube.com/watch?v=4P8qj0fkq5w&list=PLCiN2s_UthxqqToUKh21FUSSUAiwVDhAE&ab_channel=2020';

downloadPlaylist(PLAYLIST_URL);
