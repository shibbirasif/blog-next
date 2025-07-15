import { dbConnect } from '../src/lib/db';
import Tag from '../src/models/Tag';

const predefinedTags = [
    // Technology & Programming
    { name: 'programming', description: 'Programming and software development', color: '#007ACC' },
    { name: 'technology', description: 'Technology news and trends', color: '#4285F4' },
    { name: 'computer', description: 'Computer science and hardware', color: '#0078D4' },
    { name: 'artificial-intelligence', description: 'AI and machine learning', color: '#FF6B35' },
    { name: 'web-development', description: 'Web development and design', color: '#61DAFB' },
    { name: 'mobile-apps', description: 'Mobile app development', color: '#34A853' },
    { name: 'cybersecurity', description: 'Cybersecurity and data protection', color: '#E74C3C' },

    // Arts & Literature
    { name: 'literature', description: 'Books, poetry, and literary works', color: '#8B4513' },
    { name: 'writing', description: 'Creative writing and storytelling', color: '#6A5ACD' },
    { name: 'poetry', description: 'Poetry and verse', color: '#DDA0DD' },
    { name: 'art', description: 'Visual arts and creativity', color: '#FF69B4' },
    { name: 'photography', description: 'Photography and visual storytelling', color: '#708090' },
    { name: 'music', description: 'Music and sound arts', color: '#FF4500' },
    { name: 'film', description: 'Movies and cinematography', color: '#B8860B' },
    { name: 'theater', description: 'Theater and performing arts', color: '#8B008B' },

    // History & Culture
    { name: 'history', description: 'Historical events and analysis', color: '#654321' },
    { name: 'culture', description: 'Cultural topics and traditions', color: '#FF8C00' },
    { name: 'philosophy', description: 'Philosophical thoughts and ideas', color: '#4B0082' },
    { name: 'religion', description: 'Religious topics and spirituality', color: '#DAA520' },
    { name: 'anthropology', description: 'Human culture and society', color: '#CD853F' },
    { name: 'archaeology', description: 'Archaeological discoveries', color: '#8FBC8F' },

    // Science & Education
    { name: 'science', description: 'Scientific research and discoveries', color: '#00CED1' },
    { name: 'education', description: 'Learning and educational content', color: '#32CD32' },
    { name: 'mathematics', description: 'Mathematics and mathematical concepts', color: '#FF1493' },
    { name: 'physics', description: 'Physics and physical sciences', color: '#1E90FF' },
    { name: 'chemistry', description: 'Chemistry and chemical sciences', color: '#98FB98' },
    { name: 'biology', description: 'Biology and life sciences', color: '#90EE90' },
    { name: 'psychology', description: 'Psychology and mental health', color: '#DEB887' },

    // Lifestyle & Fashion
    { name: 'fashion', description: 'Fashion trends and style', color: '#FF1493' },
    { name: 'makeup', description: 'Makeup tutorials and beauty tips', color: '#FFB6C1' },
    { name: 'beauty', description: 'Beauty and skincare', color: '#FFC0CB' },
    { name: 'lifestyle', description: 'Lifestyle and personal development', color: '#20B2AA' },
    { name: 'daily-life', description: 'Daily life experiences and stories', color: '#87CEEB' },
    { name: 'relationships', description: 'Relationships and dating', color: '#F08080' },
    { name: 'parenting', description: 'Parenting tips and experiences', color: '#FFE4B5' },

    // Health & Wellness
    { name: 'health', description: 'Health and medical topics', color: '#DC143C' },
    { name: 'fitness', description: 'Fitness and exercise', color: '#FF6347' },
    { name: 'mental-health', description: 'Mental health and wellbeing', color: '#9370DB' },
    { name: 'nutrition', description: 'Nutrition and healthy eating', color: '#228B22' },
    { name: 'meditation', description: 'Meditation and mindfulness', color: '#7B68EE' },
    { name: 'wellness', description: 'Overall wellness and self-care', color: '#48D1CC' },

    // Food & Cooking
    { name: 'cooking', description: 'Recipes and cooking tips', color: '#FF8C00' },
    { name: 'food', description: 'Food reviews and culinary experiences', color: '#FFA500' },
    { name: 'baking', description: 'Baking recipes and techniques', color: '#DEB887' },
    { name: 'restaurant-reviews', description: 'Restaurant and food reviews', color: '#F4A460' },

    // Travel & Adventure
    { name: 'travel', description: 'Travel experiences and guides', color: '#4169E1' },
    { name: 'adventure', description: 'Adventure and outdoor activities', color: '#228B22' },
    { name: 'backpacking', description: 'Backpacking and budget travel', color: '#8B4513' },
    { name: 'photography-travel', description: 'Travel photography', color: '#5F9EA0' },

    // Business & Career
    { name: 'business', description: 'Business and entrepreneurship', color: '#2F4F4F' },
    { name: 'career', description: 'Career advice and development', color: '#708090' },
    { name: 'entrepreneurship', description: 'Starting and running businesses', color: '#B8860B' },
    { name: 'finance', description: 'Personal finance and investment', color: '#006400' },
    { name: 'marketing', description: 'Marketing and advertising', color: '#FF4500' },

    // Politics & Society
    { name: 'politics', description: 'Political discussions and analysis', color: '#B22222' },
    { name: 'social-issues', description: 'Social issues and activism', color: '#DC143C' },
    { name: 'environment', description: 'Environmental issues and sustainability', color: '#228B22' },
    { name: 'economics', description: 'Economic topics and analysis', color: '#2F4F4F' },
    { name: 'current-events', description: 'News and current events', color: '#8B0000' },

    // Hobbies & Interests
    { name: 'gaming', description: 'Video games and gaming culture', color: '#9932CC' },
    { name: 'sports', description: 'Sports and athletics', color: '#FF6347' },
    { name: 'gardening', description: 'Gardening and plant care', color: '#32CD32' },
    { name: 'diy', description: 'Do-it-yourself projects', color: '#FF8C00' },
    { name: 'crafts', description: 'Crafts and handmade items', color: '#DA70D6' },
    { name: 'books', description: 'Book reviews and recommendations', color: '#8B4513' },
    { name: 'movies', description: 'Movie reviews and discussions', color: '#4682B4' },

    // Personal Development
    { name: 'self-improvement', description: 'Personal growth and development', color: '#9370DB' },
    { name: 'motivation', description: 'Motivational content', color: '#FF6347' },
    { name: 'productivity', description: 'Productivity tips and techniques', color: '#4682B4' },
    { name: 'mindfulness', description: 'Mindfulness and awareness', color: '#7B68EE' },

    // Content Types
    { name: 'tutorial', description: 'How-to guides and tutorials', color: '#2ECC71' },
    { name: 'review', description: 'Product and service reviews', color: '#F1C40F' },
    { name: 'opinion', description: 'Personal opinions and thoughts', color: '#34495E' },
    { name: 'story', description: 'Personal stories and experiences', color: '#E67E22' },
    { name: 'tips', description: 'Tips and life hacks', color: '#8E44AD' },
    { name: 'news', description: 'News and updates', color: '#C0392B' },
    { name: 'beginner', description: 'Beginner-friendly content', color: '#1ABC9C' },
    { name: 'advanced', description: 'Advanced level content', color: '#E74C3C' }
];

async function generateTags() {
    try {
        console.log('🔗 Connecting to database...');
        await dbConnect();

        console.log('🧹 Clearing existing tags...');
        await Tag.deleteMany({});

        console.log('📝 Creating predefined tags...');
        const createdTags = await Tag.insertMany(predefinedTags);

        console.log(`✅ Successfully created ${createdTags.length} tags:`);

        // Group tags by category for better display
        const categories = {
            'Technology & Programming': createdTags.filter(tag =>
                ['programming', 'technology', 'computer', 'artificial-intelligence', 'web-development', 'mobile-apps', 'cybersecurity'].includes(tag.name)
            ),
            'Arts & Literature': createdTags.filter(tag =>
                ['literature', 'writing', 'poetry', 'art', 'photography', 'music', 'film', 'theater'].includes(tag.name)
            ),
            'History & Culture': createdTags.filter(tag =>
                ['history', 'culture', 'philosophy', 'religion', 'anthropology', 'archaeology'].includes(tag.name)
            ),
            'Science & Education': createdTags.filter(tag =>
                ['science', 'education', 'mathematics', 'physics', 'chemistry', 'biology', 'psychology'].includes(tag.name)
            ),
            'Lifestyle & Fashion': createdTags.filter(tag =>
                ['fashion', 'makeup', 'beauty', 'lifestyle', 'daily-life', 'relationships', 'parenting'].includes(tag.name)
            ),
            'Health & Wellness': createdTags.filter(tag =>
                ['health', 'fitness', 'mental-health', 'nutrition', 'meditation', 'wellness'].includes(tag.name)
            ),
            'Food & Cooking': createdTags.filter(tag =>
                ['cooking', 'food', 'baking', 'restaurant-reviews'].includes(tag.name)
            ),
            'Travel & Adventure': createdTags.filter(tag =>
                ['travel', 'adventure', 'backpacking', 'photography-travel'].includes(tag.name)
            ),
            'Business & Career': createdTags.filter(tag =>
                ['business', 'career', 'entrepreneurship', 'finance', 'marketing'].includes(tag.name)
            ),
            'Politics & Society': createdTags.filter(tag =>
                ['politics', 'social-issues', 'environment', 'economics', 'current-events'].includes(tag.name)
            ),
            'Hobbies & Interests': createdTags.filter(tag =>
                ['gaming', 'sports', 'gardening', 'diy', 'crafts', 'books', 'movies'].includes(tag.name)
            ),
            'Personal Development': createdTags.filter(tag =>
                ['self-improvement', 'motivation', 'productivity', 'mindfulness'].includes(tag.name)
            ),
            'Content Types': createdTags.filter(tag =>
                ['tutorial', 'review', 'opinion', 'story', 'tips', 'news', 'beginner', 'advanced'].includes(tag.name)
            )
        };

        Object.entries(categories).forEach(([category, tags]) => {
            console.log(`\n📂 ${category}:`);
            tags.forEach(tag => {
                console.log(`   • ${tag.name} (${tag.color})`);
            });
        });

        console.log('\n🎉 Tag generation completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error generating tags:', error);
        process.exit(1);
    }
}

generateTags();
