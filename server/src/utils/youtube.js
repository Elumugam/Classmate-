const axios = require('axios');

const searchYouTube = async (query) => {
    try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                part: 'snippet',
                maxResults: 10,
                q: query + " education lecture tutorial",
                type: 'video',
                videoEmbeddable: 'true',
                safeSearch: 'strict',
                videoCategoryId: '27', // Education Category ID
                key: process.env.YOUTUBE_API_KEY
            }
        });

        // Filter out obviously bad titles just in case
        const safeItems = response.data.items.filter(item => {
            const title = item.snippet.title.toLowerCase();
            const bannedInputs = ['swearing', 'adult', 'nsfw', 'gameplay', 'fortnite', 'roblox'];
            return !bannedInputs.some(bad => title.includes(bad));
        });

        return safeItems.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.high.url,
            channel: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt
        }));
    } catch (error) {
        console.error('YouTube Search Failed:', error.response?.data || error.message);
        return []; // Return empty on error to not crash app
    }
};

module.exports = { searchYouTube };
