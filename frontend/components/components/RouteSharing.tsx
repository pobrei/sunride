'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@frontend/components/ui/card';
import { Button } from '@frontend/components/ui/button';
import { Share2, Copy, Check, Link, Mail, Twitter, Facebook } from 'lucide-react';
import { useWeather } from '@frontend/context/WeatherContext';

const RouteSharing: React.FC = () => {
  const { gpxData, forecastPoints } = useWeather();
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  // Generate a shareable link
  const generateShareableLink = async () => {
    if (!gpxData || forecastPoints.length === 0) return;

    setIsGeneratingLink(true);

    try {
      // In a real implementation, this would call an API to save the route data
      // and generate a unique ID for sharing
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate a mock URL with a random ID
      const mockId = Math.random().toString(36).substring(2, 10);
      const url =
        typeof window !== 'undefined'
          ? `${window.location.origin}/shared/${mockId}`
          : `/shared/${mockId}`;

      setShareUrl(url);
    } catch (error) {
      console.error('Error generating shareable link:', error);
    } finally {
      setIsGeneratingLink(false);
    }
  };

  // Copy the link to clipboard
  const copyToClipboard = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  // Share via email
  const shareViaEmail = () => {
    if (typeof window === 'undefined') return;
    const subject = encodeURIComponent(`Check out my route: ${gpxData?.name || 'My Route'}`);
    const body = encodeURIComponent(
      `I've planned a route with weather forecasting and wanted to share it with you: ${shareUrl}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  // Share via Twitter
  const shareViaTwitter = () => {
    if (typeof window === 'undefined') return;
    const text = encodeURIComponent(
      `Check out my route with weather forecast: ${gpxData?.name || 'My Route'} ${shareUrl}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`);
  };

  // Share via Facebook
  const shareViaFacebook = () => {
    if (typeof window === 'undefined') return;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Share Your Route</CardTitle>
        <CardDescription>
          Generate a shareable link to your route with weather forecast
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!shareUrl ? (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Create a shareable link that allows others to view your route with the current weather
              forecast.
            </p>
            <Button
              onClick={generateShareableLink}
              disabled={isGeneratingLink || !gpxData || forecastPoints.length === 0}
              className="w-full"
            >
              {isGeneratingLink ? (
                <>
                  <Share2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating link...
                </>
              ) : (
                <>
                  <Share2 className="mr-2 h-4 w-4" />
                  Generate Shareable Link
                </>
              )}
            </Button>

            {(!gpxData || forecastPoints.length === 0) && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Please upload a GPX file and generate a forecast first
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="flex-1 p-3 bg-muted rounded-md overflow-x-auto whitespace-nowrap">
                <code className="text-sm">{shareUrl}</code>
              </div>
              <Button
                size="icon"
                variant="outline"
                onClick={copyToClipboard}
                aria-label="Copy link to clipboard"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Button
                variant="outline"
                onClick={shareViaEmail}
                className="flex flex-col h-auto py-4"
              >
                <Mail className="h-5 w-5 mb-1" />
                <span className="text-xs">Email</span>
              </Button>
              <Button
                variant="outline"
                onClick={shareViaTwitter}
                className="flex flex-col h-auto py-4"
              >
                <Twitter className="h-5 w-5 mb-1" />
                <span className="text-xs">Twitter</span>
              </Button>
              <Button
                variant="outline"
                onClick={shareViaFacebook}
                className="flex flex-col h-auto py-4"
              >
                <Facebook className="h-5 w-5 mb-1" />
                <span className="text-xs">Facebook</span>
              </Button>
            </div>

            <div className="p-4 bg-muted rounded-md">
              <h4 className="font-medium mb-2 flex items-center">
                <Link className="h-4 w-4 mr-2" />
                Link Information
              </h4>
              <p className="text-sm text-muted-foreground">
                This link will allow others to view your route with the current weather forecast.
                The link will expire after 30 days.
              </p>
            </div>

            <Button
              variant="outline"
              onClick={generateShareableLink}
              disabled={isGeneratingLink}
              className="w-full"
            >
              {isGeneratingLink ? (
                <>
                  <Share2 className="mr-2 h-4 w-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                'Generate New Link'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RouteSharing;
