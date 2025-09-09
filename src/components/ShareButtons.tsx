'use client'

import { useState } from 'react'
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Mail, 
  Link2, 
  MessageCircle,
  Printer,
  Share2
} from 'lucide-react'

interface ShareButtonsProps {
  url: string
  title: string
  description?: string
  className?: string
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function ShareButtons({ 
  url, 
  title, 
  description, 
  className = '',
  showLabel = true,
  size = 'md'
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`
  const encodedUrl = encodeURIComponent(fullUrl)
  const encodedTitle = encodeURIComponent(title)
  const encodedDescription = encodeURIComponent(description || title)

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20
  const buttonSize = size === 'sm' ? 'p-2' : size === 'lg' ? 'p-3' : 'p-2.5'

  const shareButtons = [
    {
      name: 'Facebook',
      icon: Facebook,
      href: shareLinks.facebook,
      color: 'hover:bg-blue-600 hover:text-white',
      bgColor: 'bg-blue-500'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      href: shareLinks.twitter,
      color: 'hover:bg-black hover:text-white',
      bgColor: 'bg-gray-800'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      href: shareLinks.linkedin,
      color: 'hover:bg-blue-700 hover:text-white',
      bgColor: 'bg-blue-700'
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      href: shareLinks.whatsapp,
      color: 'hover:bg-green-600 hover:text-white',
      bgColor: 'bg-green-500'
    },
    {
      name: 'Email',
      icon: Mail,
      href: shareLinks.email,
      color: 'hover:bg-gray-600 hover:text-white',
      bgColor: 'bg-gray-500'
    }
  ]

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <span className="text-sm text-gray-600 font-medium">Dela:</span>
      )}
      
      {/* Desktop: Show all buttons */}
      <div className="hidden md:flex items-center gap-2">
        {shareButtons.map((button) => (
          <a
            key={button.name}
            href={button.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`${buttonSize} rounded-full border border-gray-300 text-gray-600 transition-all duration-200 ${button.color} hover:border-transparent`}
            title={`Dela på ${button.name}`}
          >
            <button.icon size={iconSize} />
          </a>
        ))}
        
        <button
          onClick={handleCopyLink}
          className={`${buttonSize} rounded-full border border-gray-300 text-gray-600 hover:bg-gray-600 hover:text-white hover:border-transparent transition-all duration-200`}
          title={copied ? 'Länk kopierad!' : 'Kopiera länk'}
        >
          <Link2 size={iconSize} />
        </button>
        
        <button
          onClick={handlePrint}
          className={`${buttonSize} rounded-full border border-gray-300 text-gray-600 hover:bg-gray-600 hover:text-white hover:border-transparent transition-all duration-200`}
          title="Skriv ut"
        >
          <Printer size={iconSize} />
        </button>
      </div>

      {/* Mobile: Show dropdown */}
      <div className="md:hidden relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={`${buttonSize} rounded-full border border-gray-300 text-gray-600 hover:bg-vgbf-blue hover:text-white hover:border-transparent transition-all duration-200`}
          title="Dela artikel"
        >
          <Share2 size={iconSize} />
        </button>
        
        {showDropdown && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowDropdown(false)}
            />
            
            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
              {shareButtons.map((button) => (
                <a
                  key={button.name}
                  href={button.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setShowDropdown(false)}
                >
                  <div className={`p-1.5 rounded ${button.bgColor} text-white`}>
                    <button.icon size={14} />
                  </div>
                  Dela på {button.name}
                </a>
              ))}
              
              <button
                onClick={() => {
                  handleCopyLink()
                  setShowDropdown(false)
                }}
                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
              >
                <div className="p-1.5 rounded bg-gray-500 text-white">
                  <Link2 size={14} />
                </div>
                {copied ? 'Länk kopierad!' : 'Kopiera länk'}
              </button>
              
              <button
                onClick={() => {
                  handlePrint()
                  setShowDropdown(false)
                }}
                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
              >
                <div className="p-1.5 rounded bg-gray-500 text-white">
                  <Printer size={14} />
                </div>
                Skriv ut
              </button>
            </div>
          </>
        )}
      </div>

      {/* Copy success message */}
      {copied && (
        <span className="text-sm text-green-600 font-medium animate-fade-in">
          Kopierad!
        </span>
      )}
    </div>
  )
}
