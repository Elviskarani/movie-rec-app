'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { UserPreferences } from '@/lib/types';
import { setStorageItem, getStorageItem } from '@/lib/storage';

export default function PreferencesPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [preferences, setPreferences] = useState<UserPreferences>({
    mood: '',
    watchingWith: '',
    genre: '',
    oldMovie: false,
    ageAppropriate: false,
    category: 'popular'
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const totalSteps = 5; // mood, watchingWith, genre, category, checkboxes

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    (async () => {
      // Load existing preferences if they exist
      const savedPreferences = await getStorageItem<UserPreferences>('userPreferences');
      if (savedPreferences) {
        setPreferences(savedPreferences);
      }
    })();
  }, [user, router]);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Save preferences to localStorage
      setStorageItem('userPreferences', preferences);

      // Navigate to recommendations page
      router.push('/recommendations');
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const goToNextStep = () => {
    if (currentStep < totalSteps - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const goBackToHome = () => {
    router.push('/home');
  };

  const canProceedFromStep = (step: number) => {
    switch (step) {
      case 0: return !!preferences.mood;
      case 1: return !!preferences.watchingWith;
      case 2: return true; // Genre is optional
      case 3: return true; // Category has default
      case 4: return true; // Checkboxes are optional
      default: return false;
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 0: return "What's your mood?";
      case 1: return "Who are you watching with?";
      case 2: return "Any preferred genre?";
      case 3: return "What type of movies?";
      case 4: return "Any additional preferences?";
      default: return "";
    }
  };

  const getStepSubtitle = (step: number) => {
    switch (step) {
      case 0: return "How are you feeling right now?";
      case 1: return "This helps us pick the right content";
      case 2: return "We can suggest something from any genre";
      case 3: return "Popular hits or hidden gems?";
      case 4: return "Just a couple more options";
      default: return "";
    }
  };

  if (!user) return null;

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            {[
              { mood: 'Happy', span: 'col-span-1 sm:col-span-3' },
              { mood: 'Sad', span: 'col-span-1 sm:col-span-3' },
              { mood: 'Excited', span: 'col-span-1 sm:col-span-2' },
              { mood: 'Relaxed', span: 'col-span-1 sm:col-span-2' },
              { mood: 'Adventurous', span: 'col-span-1 sm:col-span-2' },
              { mood: 'Romantic', span: 'col-span-2 sm:col-span-6' }
            ].map((item) => (
              <button
                key={item.mood}
                type="button"
                onClick={() => {
                  updatePreference('mood', item.mood.toLowerCase());
                  setTimeout(() => goToNextStep(), 500);
                }}
                className={`p-3 sm:p-4 rounded-lg text-center transition-all duration-200 transform hover:scale-105 text-sm sm:text-base ${item.span} ${preferences.mood === item.mood.toLowerCase()
                    ? 'bg-green-700 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
              >
                {item.mood}
              </button>
            ))}
          </div>
        );

      case 1:
        return (
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            {[
              { option: 'Alone', span: 'col-span-1 sm:col-span-2' },
              { option: 'Partner', span: 'col-span-1 sm:col-span-2' },
              { option: 'Family', span: 'col-span-1 sm:col-span-2' },
              { option: 'Friends', span: 'col-span-1 sm:col-span-3' },
              { option: 'Kids', span: 'col-span-2 sm:col-span-3' }
            ].map((item) => (
              <button
                key={item.option}
                type="button"
                onClick={() => {
                  updatePreference('watchingWith', item.option.toLowerCase());
                  setTimeout(() => goToNextStep(), 500);
                }}
                className={`p-3 sm:p-4 rounded-lg text-center transition-all duration-200 transform hover:scale-105 text-sm sm:text-base ${item.span} ${preferences.watchingWith === item.option.toLowerCase()
                    ? 'bg-green-700 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
              >
                {item.option}
              </button>
            ))}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
              {[
                { value: '', label: 'Any Genre', span: 'col-span-2 sm:col-span-6' },
                { value: 'action', label: 'Action', span: 'col-span-1 sm:col-span-2' },
                { value: 'adventure', label: 'Adventure', span: 'col-span-1 sm:col-span-2' },
                { value: 'animation', label: 'Animation', span: 'col-span-1 sm:col-span-2' },
                { value: 'comedy', label: 'Comedy', span: 'col-span-1 sm:col-span-3' },
                { value: 'crime', label: 'Crime', span: 'col-span-1 sm:col-span-3' },
                { value: 'drama', label: 'Drama', span: 'col-span-1 sm:col-span-2' },
                { value: 'family', label: 'Family', span: 'col-span-1 sm:col-span-2' },
                { value: 'fantasy', label: 'Fantasy', span: 'col-span-1 sm:col-span-2' },
                { value: 'horror', label: 'Horror', span: 'col-span-1 sm:col-span-3' },
                { value: 'mystery', label: 'Mystery', span: 'col-span-1 sm:col-span-3' },
                { value: 'romance', label: 'Romance', span: 'col-span-1 sm:col-span-2' },
                { value: 'science fiction', label: 'Sci-Fi', span: 'col-span-1 sm:col-span-2' },
                { value: 'thriller', label: 'Thriller', span: 'col-span-1 sm:col-span-2' }
              ].map((genre) => (
                <button
                  key={genre.value}
                  type="button"
                  onClick={() => {
                    updatePreference('genre', genre.value);
                    setTimeout(() => goToNextStep(), 500);
                  }}
                  className={`p-2 sm:p-3 rounded-lg text-center transition-all duration-200 transform hover:scale-105 text-sm sm:text-base ${genre.span || 'col-span-1 sm:col-span-2'
                    } ${preferences.genre === genre.value
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                  {genre.label}
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
            {[
              { value: 'popular', label: 'Popular Movies', desc: 'What everyone\'s talking about', span: 'col-span-1 sm:col-span-6' },
              { value: 'top_rated', label: 'Top Rated', desc: 'Critically acclaimed films', span: 'col-span-1 sm:col-span-3' },
              { value: 'latest', label: 'Latest Releases', desc: 'Fresh from the cinema', span: 'col-span-1 sm:col-span-3' }
            ].map((category) => (
              <button
                key={category.value}
                type="button"
                onClick={() => {
                  updatePreference('category', category.value);
                  setTimeout(() => goToNextStep(), 500);
                }}
                className={`p-3 sm:p-4 rounded-lg text-left transition-all duration-200 transform hover:scale-105 ${category.span} ${preferences.category === category.value
                    ? 'bg-green-700 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
              >
                <div className="font-semibold text-sm sm:text-base">{category.label}</div>
                <div className="text-xs sm:text-sm opacity-80">{category.desc}</div>
              </button>
            ))}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <label className={`flex items-center space-x-3 p-3 sm:p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer ${preferences.oldMovie ? 'bg-blue-600 text-white' : ''}`}>
                <input
                  type="checkbox"
                  checked={preferences.oldMovie}
                  onChange={(e) => updatePreference('oldMovie', e.target.checked)}
                  className="w-4 h-4 sm:w-5 sm:h-5 text-white bg-gray-800 border-gray-600 rounded focus:ring-blue-500 flex-shrink-0"
                />
                <div>
                  <div className="font-medium text-white text-sm sm:text-base">Older Movies</div>
                  <div className="text-xs sm:text-sm text-white opacity-80">Include classics from before 2010</div>
                </div>
              </label>

              <label className={`flex items-center space-x-3 p-3 sm:p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer ${preferences.ageAppropriate ? 'bg-blue-600 text-white' : ''}`}>
                <input
                  type="checkbox"
                  checked={preferences.ageAppropriate}
                  onChange={(e) => updatePreference('ageAppropriate', e.target.checked)}
                  className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 flex-shrink-0"
                />
                <div>
                  <div className="font-medium text-white text-sm sm:text-base">Family Friendly</div>
                  <div className="text-xs sm:text-sm text-white opacity-80">Age appropriate content only</div>
                </div>
              </label>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-800 to-green-300 hover:from-blue-700 hover:to-purple-700 text-white py-3 sm:py-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 text-sm sm:text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Getting Recommendations...
                </span>
              ) : (
                'Get My Recommendations'
              )}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header with back button and progress */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <button
            onClick={currentStep === 0 ? goBackToHome : goToPrevStep}
            className="text-gray-400 hover:text-white flex items-center space-x-2 transition-colors text-sm sm:text-base"
          >
            <span>←</span>
            <span className="hidden sm:inline">{currentStep === 0 ? 'Back to Home' : 'Previous'}</span>
            <span className="sm:hidden">{currentStep === 0 ? 'Home' : 'Back'}</span>
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-6 sm:mb-8">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-teal-800 to-green-300 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Main content */}
        <div className="bg-gray-800 rounded-xl p-4 sm:p-8 shadow-2xl">
          <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'}`}>
            {/* Title */}
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {getStepTitle(currentStep)}
              </h2>
              <p className="text-gray-400 text-sm sm:text-base">
                {getStepSubtitle(currentStep)}
              </p>
            </div>

            {/* Step content */}
            <div className="min-h-[180px] sm:min-h-[200px]">
              {renderStep()}
            </div>

            {/* Required field indicator for first two steps */}
            {(currentStep === 0 || currentStep === 1) && (
              <div className="text-center mt-4 sm:mt-6">
                <span className="text-xs sm:text-sm text-gray-400">
                  <span className="text-red-400">*</span> This field is required
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}