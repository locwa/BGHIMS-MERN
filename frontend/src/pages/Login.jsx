import {AuthContext} from "../contexts/AuthContext.jsx";
import {useNavigate} from "react-router";
import {useState, useEffect, useContext} from "react";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";

export default function Login() {
    const { user, loading, login } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [currentSlide, setCurrentSlide] = useState(0);
    const navigate = useNavigate();

    // Carousel images and content
    const carouselItems = [
        {
            title: "Advanced Medical Technology",
            description: "State-of-the-art laboratory equipment for accurate diagnostics",
            image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&q=80",
            gradient: "from-blue-600/90 to-blue-800/90"
        },
        {
            title: "Expert Healthcare Team",
            description: "Dedicated medical professionals committed to your health",
            image: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&q=80",
            gradient: "from-green-600/90 to-green-800/90"
        },
        {
            title: "Comprehensive Care",
            description: "Quality healthcare services for our community",
            image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&q=80",
            gradient: "from-purple-600/90 to-purple-800/90"
        },
        {
            title: "Modern Facilities",
            description: "Equipped with the latest medical technology and infrastructure",
            image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80",
            gradient: "from-red-600/90 to-red-800/90"
        }
    ];

    useEffect(() => {
        if (!loading && user) {
            navigate('/home');
        }
    }, [loading, user, navigate]);

    // Auto-advance carousel
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [carouselItems.length]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        try {
            await login(email, password);
            navigate('/home');
        } catch (err) {
            setError('Login failed. Please check your credentials.');
        }
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Carousel */}
            <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden bg-gray-900">
                {/* Carousel Images */}
                {carouselItems.map((item, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ${
                            index === currentSlide ? 'opacity-100' : 'opacity-0'
                        }`}
                    >
                        <img 
                            src={item.image} 
                            alt={item.title}
                            className="w-full h-full object-cover"
                        />
                        <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient}`}></div>
                        
                        {/* Content Overlay */}
                        <div className="absolute inset-0 flex flex-col justify-end p-12 text-white">
                            <div className="max-w-2xl">
                                <h2 className="text-5xl font-bold mb-4 animate-fade-in">
                                    {item.title}
                                </h2>
                                <p className="text-xl text-gray-100 mb-8 animate-fade-in">
                                    {item.description}
                                </p>
                                
                                {/* Hospital Info */}
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full">
                                        <Heart className="w-6 h-6 text-white" fill="white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold">Bontoc General Hospital</h3>
                                        <p className="text-sm text-gray-200">Excellence in Healthcare</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Navigation Arrows */}
                <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all z-10"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all z-10"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>

                {/* Dots Indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {carouselItems.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-2 h-2 rounded-full transition-all ${
                                index === currentSlide 
                                    ? 'bg-white w-8' 
                                    : 'bg-white/50 hover:bg-white/75'
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-2/5 flex items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="w-full max-w-md">
                    {/* Mobile Header (visible only on small screens) */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                            <Heart className="w-8 h-8 text-white" fill="white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Bontoc General Hospital</h1>
                        <p className="text-gray-600">Sign in to access your account</p>
                    </div>

                    {/* Desktop Header */}
                    <div className="hidden lg:block text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome Back</h1>
                        <p className="text-gray-600">Sign in to continue to your account</p>
                    </div>

                    {/* Login Card */}
                    <div className="bg-white rounded-2xl shadow-2xl p-8">
                        <div className="mb-6 text-center">
                            <h2 className="text-2xl font-bold text-gray-800">Sign In</h2>
                            <p className="text-sm text-gray-500 mt-1">Enter your credentials to continue</p>
                        </div>

                        <form onSubmit={handleLogin}>
                            <div className="mb-5">
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <input 
                                    type="email" 
                                    id="email"
                                    name="email" 
                                    placeholder="Enter your email"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Password
                                </label>
                                <input 
                                    type="password" 
                                    id="password"
                                    name="password" 
                                    placeholder="Enter your password"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                                    </svg>
                                    {error}
                                </div>
                            )}

                            <button 
                                type="submit"
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                        </svg>
                                        Signing in...
                                    </span>
                                ) : 'Sign In'}
                            </button>
                        </form>
                    </div>

                    <p className="text-center text-xs text-gray-500 mt-6">
                        <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                        </svg>
                        Your information is secure and confidential
                    </p>
                </div>
            </div>
        </div>
    );
}