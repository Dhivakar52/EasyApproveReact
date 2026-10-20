import React, { useState } from 'react';
import { Heart, MessageCircle, Share, Filter, MoreHorizontal, Eye } from 'lucide-react';
import homelogo from '../../assets/images/home_bg.png'

interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
    company: string;
    nominations?: number;
    category: string;
  };
  content: string;
  likes: number;
  comments: number;
  views: number;
  timeAgo: string;
}

const HomeComponent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Feeds' | 'My Lists'>('Feeds');

  const posts: Post[] = [
    {
      id: '1',
      author: {
        name: 'Fatima Noor',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
        company: 'SRMAP',
        nominations: 5,
        category: 'Innovation'
      },
      content: 'Recognized as the youngest team lead, I introduced innovative teaching methodologies that transformed classroom dynamics. These methods significantly enhanced student engagement by 60%. My approach fostered interactive learning and measurable improvement in student participation.',
      likes: 203,
      comments: 12,
      views: 389,
      timeAgo: '2h'
    },
    {
      id: '2',
      author: {
        name: 'Murali Krishnan',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
        company: 'SRMAP',
        nominations: 3,
        category: 'Innovation'
      },
      content: 'Excited to announce that our Business Excellence nomination has been submitted! This achievement reflects our team\'s dedication to innovation and outstanding performance. Looking forward to the recognition of our hard work.',
      likes: 86,
      comments: 32,
      views: 128,
      timeAgo: '4h'
    },
    {
      id: '3',
      author: {
        name: 'Vijay Kumar',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
        company: 'SRM Global Hospitals',
        nominations: 6,
        category: 'Talent'
      },
      content: 'Proud to share that our Service Excellence initiative has been approved! Our commitment to patient care and medical innovation continues to set new standards in healthcare delivery.',
      likes: 86,
      comments: 32,
      views: 128,
      timeAgo: '6h'
    },
    {
      id: '4',
      author: {
        name: 'Sathish Kumar',
        avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=40&h=40&fit=crop&crop=face',
        company: 'SRMAP',
        nominations: 1,
        category: 'Collaboration'
      },
      content: 'Just completed a judgment not talent technology of SuperCritical to automate few interactive processes and enhanced productivity across all departments. Grateful for the incredible team effort!',
      likes: 45,
      comments: 18,
      views: 95,
      timeAgo: '8h'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className=""
        style={{
          backgroundImage: `url(${homelogo})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "200px",
        }}
      >
        {/* <img src={homelogo} className='w-[100%]' alt="" /> */}


        <div className=" px-4 sm:px-6 lg:px-8 -mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 pt-10">
            {/* Main Content */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-lg shadow-sm">
                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 py-4 space-y-3 sm:space-y-0">
                    <div className="flex space-x-6 sm:space-x-8 overflow-x-auto">
                      <button
                        onClick={() => setActiveTab('Feeds')}
                        className={`pb-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'Feeds'
                            ? 'text-teal-600 border-teal-600'
                            : 'text-gray-500 border-transparent hover:text-gray-700'
                          }`}
                      >
                        Feeds
                      </button>
                      <button
                        onClick={() => setActiveTab('My Lists')}
                        className={`pb-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'My Lists'
                            ? 'text-teal-600 border-teal-600'
                            : 'text-gray-500 border-transparent hover:text-gray-700'
                          }`}
                      >
                        My Lists
                      </button>
                    </div>
                    <div className="flex items-center justify-end sm:justify-start space-x-2 cursor-pointer hover:bg-gray-50 px-3 py-1 rounded">
                      <Filter className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Filter</span>
                    </div>
                  </div>
                </div>

                {/* Posts */}
                <div className="divide-y divide-gray-100">
                  {posts.map((post) => (
                    <div key={post.id} className="p-4 sm:p-6">
                      <div className="flex space-x-3">
                        <img
                          src={post.author.avatar}
                          alt={post.author.name}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 mb-1">
                                <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{post.author.name}</h3>
                                <div className="flex flex-wrap gap-1 sm:gap-2">
                                  {post.author.nominations && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      👥 {post.author.nominations} Nominated
                                    </span>
                                  )}
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    🏆 {post.author.category}
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs sm:text-sm text-gray-600 mb-1">{post.author.company}</p>
                            </div>
                            <MoreHorizontal className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600 flex-shrink-0 ml-2" />
                          </div>

                          <p className="text-gray-800 mt-2 sm:mt-3 text-sm leading-relaxed">{post.content}</p>

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3 sm:mt-4 pt-3 space-y-3 sm:space-y-0">
                            <div className="flex items-center space-x-4 sm:space-x-6">
                              <button className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors">
                                <Heart className="w-4 h-4" />
                                <span className="text-sm font-medium">{post.likes} Likes</span>
                              </button>
                              <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors">
                                <MessageCircle className="w-4 h-4" />
                                <span className="text-sm font-medium">{post.comments} Comments</span>
                              </button>
                              <button className="text-gray-500 hover:text-gray-700 transition-colors">
                                <Share className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex items-center text-gray-500 text-sm">
                              <Eye className="w-4 h-4 mr-1" />
                              <span>{post.views} Views</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-4 space-y-4 lg:space-y-6 mt-6 lg:mt-0">
              {/* Profile Card */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-4 sm:px-6 py-4">
                  <div className="text-center">
                    <img
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
                      alt="Profile"
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto border-3 border-white"
                    />
                  </div>
                </div>
                <div className="px-4 sm:px-6 py-4">
                  <div className="text-center mb-4">
                    <h3 className="font-semibold text-gray-900 text-base sm:text-lg">S. Ravi Kumar</h3>
                    <p className="text-sm text-gray-600">Chennai</p>
                    <p className="text-xs sm:text-sm text-gray-500 break-all">ravikumar381@gmail.com</p>
                  </div>

                  <div className="space-y-2 sm:space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category :</span>
                      <span className="font-medium text-gray-900">Innovation</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nominated :</span>
                      <span className="font-medium text-gray-900">3</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center mt-4 space-x-2 sm:space-x-4">
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium">10 Likes</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium">5 Comments</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nomination Stats */}
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <h3 className="font-semibold text-gray-900 mb-4 text-base sm:text-lg">Nomination Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Nomination Others</span>
                    <span className="font-semibold text-blue-600 text-lg">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Self Nomination</span>
                    <span className="font-semibold text-blue-600 text-lg">1</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Pending Status</span>
                    <span className="font-semibold text-orange-600 text-lg">2</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Approved</span>
                    <span className="font-semibold text-green-600 text-lg">2</span>
                  </div>
                </div>
              </div>

              {/* Top Performers */}
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <h3 className="font-semibold text-gray-900 mb-4 text-base sm:text-lg">Top 3 Performers in Each Category</h3>

                <div className="mb-6">
                  <h4 className="font-medium text-gray-800 text-sm mb-3">Customer Focus</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-600 text-sm font-medium">Vijay</span>
                      <span className="text-blue-600 font-semibold">120 Likes</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-600 text-sm font-medium">Karthik</span>
                      <span className="text-blue-600 font-semibold">110 Likes</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-600 text-sm font-medium">Kumaran</span>
                      <span className="text-blue-600 font-semibold">98 Likes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeComponent;