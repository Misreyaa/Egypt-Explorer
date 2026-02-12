import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { MapPin, Upload, Save, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface HiddenGemFormData {
  name: string;
  category: string;
  sub_category: string;
  city: string;
  governorate: string;
  location: string;
  short_description: string;
  historical_context: string;
  what_makes_it_special: string;
  visitor_experience: string;
  opening_hours: string;
  best_time_to_visit: string;
  dress_code: string;
  accessibility: string;
  traffic_and_access: string;
  average_visit_duration: string;
  entry_fee: string;
  safety_notes: string;
  local_tips: string;
  tags: string[];
  image_path: string;
}

const categories = [
  'Historical Site',
  'Restaurant',
  'Cafe',
  'Market',
  'Museum',
  'Beach',
  'Park',
  'Art Gallery',
  'Mosque',
  'Church',
  'Shopping',
  'Entertainment',
  'Nature',
  'Hidden Gem',
  'Other'
];

const governorates = [
  'Cairo',
  'Giza',
  'Alexandria',
  'Aswan',
  'Luxor',
  'Port Said',
  'Suez',
  'Ismailia',
  'Sharm El Sheikh',
  'Hurghada',
  'Marsa Alam',
  'Dahab',
  'Fayoum',
  'Siwa',
  'Other'
];

const availableTags = [
  'Family-Friendly',
  'Budget-Friendly',
  'Luxury',
  'Instagram-Worthy',
  'Off-the-Beaten-Path',
  'Authentic',
  'Local Favorite',
  'Romantic',
  'Adventure',
  'Cultural',
  'Historical',
  'Food & Drink',
  'Nightlife',
  'Shopping',
  'Nature',
  'Religious',
  'Educational'
];

export const HiddenGemForm: React.FC = () => {
  const [formData, setFormData] = useState<HiddenGemFormData>({
    name: '',
    category: '',
    sub_category: '',
    city: '',
    governorate: '',
    location: '',
    short_description: '',
    historical_context: '',
    what_makes_it_special: '',
    visitor_experience: '',
    opening_hours: '',
    best_time_to_visit: '',
    dress_code: '',
    accessibility: '',
    traffic_and_access: '',
    average_visit_duration: '',
    entry_fee: '',
    safety_notes: '',
    local_tips: '',
    tags: [],
    image_path: ''
  });

  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof HiddenGemFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, image_path: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.category || !formData.city || !formData.governorate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Parse location string (lat, lng format) into coordinates object
      let locationCoords = { lat: 0, lng: 0 };
      if (formData.location) {
        const coordMatch = formData.location.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
        if (coordMatch) {
          locationCoords = {
            lat: parseFloat(coordMatch[1]),
            lng: parseFloat(coordMatch[2])
          };
        }
      }

      // Prepare destination data for API
      const destinationPayload = {
        name: formData.name,
        place_id: `place_${Date.now()}`,
        category: formData.category,
        sub_category: formData.sub_category,
        city: formData.city,
        governorate: formData.governorate,
        location: locationCoords,
        short_description: formData.short_description,
        historical_context: formData.historical_context,
        what_makes_it_special: formData.what_makes_it_special,
        visitor_experience: formData.visitor_experience,
        opening_hours: formData.opening_hours,
        best_time_to_visit: formData.best_time_to_visit,
        dress_code: formData.dress_code,
        accessibility: formData.accessibility,
        traffic_and_access: formData.traffic_and_access,
        average_visit_duration: formData.average_visit_duration,
        entry_fee: formData.entry_fee,
        safety_notes: formData.safety_notes,
        local_tips: formData.local_tips,
        tags: formData.tags,
        image_path: formData.image_path,
        last_updated: new Date().toISOString()
      };

      // Call POST API endpoint
      const response = await fetch('http://127.0.0.1:8080/destinations/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(destinationPayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit destination');
      }

      const result = await response.json();

      toast.success(`Hidden gem submitted successfully! Destination ID: ${result._id}`);

      // Reset form
      setFormData({
        name: '',
        category: '',
        sub_category: '',
        city: '',
        governorate: '',
        location: '',
        short_description: '',
        historical_context: '',
        what_makes_it_special: '',
        visitor_experience: '',
        opening_hours: '',
        best_time_to_visit: '',
        dress_code: '',
        accessibility: '',
        traffic_and_access: '',
        average_visit_duration: '',
        entry_fee: '',
        safety_notes: '',
        local_tips: '',
        tags: [],
        image_path: ''
      });
      setImagePreview('');
    } catch (error) {

      const errorMessage = error instanceof Error ? error.message : 'Failed to submit hidden gem. Please try again.';
      toast.error(errorMessage);
      console.error('Submission error:', error);


    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="shadow-lg border-border">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-yellow-500" />
              Uncover a Hidden Gem
            </CardTitle>
            <CardDescription className="text-base">
              Share a special place with tourists visiting Egypt. Your local knowledge helps travelers discover authentic experiences.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">
                      Location Name <span className="text-red-900">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., Al-Azhar Park"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">
                      Category <span className="text-red-900">*</span>
                    </Label>
                    <Select value={formData.category} onValueChange={(val) => handleInputChange('category', val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="sub_category">
                      Sub Category <span className="text-red-900">*</span>
                    </Label>
                    <Input
                      id="sub_category"
                      value={formData.sub_category}
                      onChange={(e) => handleInputChange('sub_category', e.target.value)}
                      placeholder="e.g., local_experiences, ancient_sites"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="city">
                      City <span className="text-red-900">*</span>
                    </Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="e.g., Cairo"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="governorate">
                      Governorate <span className="text-red-900">*</span>
                    </Label>
                    <Select value={formData.governorate} onValueChange={(val) => handleInputChange('governorate', val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select governorate" />
                      </SelectTrigger>
                      <SelectContent>
                        {governorates.map(gov => (
                          <SelectItem key={gov} value={gov}>{gov}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location / Address
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Full address or GPS coordinates"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Descriptions
                </h3>

                <div>
                  <Label htmlFor="short_description">Short Description</Label>
                  <Textarea
                    id="short_description"
                    value={formData.short_description}
                    onChange={(e) => handleInputChange('short_description', e.target.value)}
                    placeholder="A brief, catchy description (1-2 sentences)"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="historical_context">Historical Context</Label>
                  <Textarea
                    id="historical_context"
                    value={formData.historical_context}
                    onChange={(e) => handleInputChange('historical_context', e.target.value)}
                    placeholder="Historical background or significance"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="what_makes_it_special">What Makes It Special?</Label>
                  <Textarea
                    id="what_makes_it_special"
                    value={formData.what_makes_it_special}
                    onChange={(e) => handleInputChange('what_makes_it_special', e.target.value)}
                    placeholder="What makes this place unique and worth visiting?"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="visitor_experience">Visitor Experience</Label>
                  <Textarea
                    id="visitor_experience"
                    value={formData.visitor_experience}
                    onChange={(e) => handleInputChange('visitor_experience', e.target.value)}
                    placeholder="What can visitors expect? What activities are available?"
                    rows={3}
                  />
                </div>
              </div>

              {/* Practical Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Practical Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="opening_hours">Opening Hours</Label>
                    <Input
                      id="opening_hours"
                      value={formData.opening_hours}
                      onChange={(e) => handleInputChange('opening_hours', e.target.value)}
                      placeholder="e.g., 9 AM - 6 PM daily"
                    />
                  </div>

                  <div>
                    <Label htmlFor="best_time_to_visit">Best Time to Visit</Label>
                    <Input
                      id="best_time_to_visit"
                      value={formData.best_time_to_visit}
                      onChange={(e) => handleInputChange('best_time_to_visit', e.target.value)}
                      placeholder="e.g., Early morning or sunset"
                    />
                  </div>

                  <div>
                    <Label htmlFor="average_visit_duration">Average Visit Duration</Label>
                    <Input
                      id="average_visit_duration"
                      value={formData.average_visit_duration}
                      onChange={(e) => handleInputChange('average_visit_duration', e.target.value)}
                      placeholder="e.g., 1-2 hours"
                    />
                  </div>

                  <div>
                    <Label htmlFor="entry_fee">Entry Fee</Label>
                    <Input
                      id="entry_fee"
                      value={formData.entry_fee}
                      onChange={(e) => handleInputChange('entry_fee', e.target.value)}
                      placeholder="e.g., Free or 50 EGP"
                    />
                  </div>

                  <div>
                    <Label htmlFor="dress_code">Dress Code</Label>
                    <Input
                      id="dress_code"
                      value={formData.dress_code}
                      onChange={(e) => handleInputChange('dress_code', e.target.value)}
                      placeholder="e.g., Modest dress required"
                    />
                  </div>

                  <div>
                    <Label htmlFor="accessibility">Accessibility</Label>
                    <Input
                      id="accessibility"
                      value={formData.accessibility}
                      onChange={(e) => handleInputChange('accessibility', e.target.value)}
                      placeholder="e.g., Wheelchair accessible"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="traffic_and_access">Traffic & Access</Label>
                  <Textarea
                    id="traffic_and_access"
                    value={formData.traffic_and_access}
                    onChange={(e) => handleInputChange('traffic_and_access', e.target.value)}
                    placeholder="How to get there? Parking availability? Public transport options?"
                    rows={2}
                  />
                </div>
              </div>

              {/* Safety & Tips */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Safety & Local Tips
                </h3>

                <div>
                  <Label htmlFor="safety_notes">Safety Notes</Label>
                  <Textarea
                    id="safety_notes"
                    value={formData.safety_notes}
                    onChange={(e) => handleInputChange('safety_notes', e.target.value)}
                    placeholder="Any safety considerations or warnings"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="local_tips">Local Tips</Label>
                  <Textarea
                    id="local_tips"
                    value={formData.local_tips}
                    onChange={(e) => handleInputChange('local_tips', e.target.value)}
                    placeholder="Insider tips that only locals know"
                    rows={3}
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Tags
                </h3>
                <p className="text-sm text-muted-foreground">Select all that apply</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {availableTags.map(tag => (
                    <div
                      key={tag}
                      className={`flex items-center space-x-2 p-2 border rounded-lg cursor-pointer transition-colors ${formData.tags.includes(tag) ? 'bg-primary/10 border-primary' : 'hover:bg-accent'
                        }`}
                      onClick={() => handleTagToggle(tag)}
                    >
                      <Checkbox
                        checked={formData.tags.includes(tag)}
                        onCheckedChange={() => handleTagToggle(tag)}
                      />
                      <Label className="cursor-pointer text-sm">{tag}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Image
                </h3>

                <div>
                  <Label htmlFor="image">Upload Image</Label>
                  <div className="mt-2">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-64 object-cover rounded-lg border border-border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setImagePreview('');
                            setFormData(prev => ({ ...prev, image_path: '' }));
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <Label
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                      >
                        <Upload className="h-12 w-12 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">Click to upload image</span>
                        <span className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</span>
                      </Label>
                    )}
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  className="w-full md:w-auto gap-2 bg-pine-primary hover:bg-pine-dark"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>Submitting...</>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Submit Hidden Gem
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
