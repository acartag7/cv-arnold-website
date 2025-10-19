'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Save, Eye, Upload } from 'lucide-react'
import { CVData } from '@/types'
import cvData from '@/data/cv-data.json'

export default function AdminPage() {
  const [data, setData] = useState<CVData>(cvData as CVData)
  const [activeSection, setActiveSection] = useState('personal')
  const [isPreview, setIsPreview] = useState(false)

  const sections = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'summary', label: 'Summary' },
    { id: 'experience', label: 'Experience' },
    { id: 'achievements', label: 'Achievements' },
    { id: 'skills', label: 'Skills' },
    { id: 'certifications', label: 'Certifications' },
    { id: 'education', label: 'Education' },
    { id: 'languages', label: 'Languages' },
  ]

  const handleSave = () => {
    // In a real implementation, this would save to a backend
    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'cv-data.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = e => {
        try {
          const importedData = JSON.parse(e.target?.result as string)
          setData(importedData)
        } catch {
          alert('Invalid JSON file')
        }
      }
      reader.readAsText(file)
    }
  }

  const updatePersonalInfo = (field: string, value: string) => {
    setData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value,
      },
    }))
  }

  const updateSummary = (value: string) => {
    setData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        summary: value,
      },
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              CV Admin Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsPreview(!isPreview)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Eye size={16} />
                <span>{isPreview ? 'Edit' : 'Preview'}</span>
              </button>
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save size={16} />
                <span>Export Data</span>
              </button>
              <label className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
                <Upload size={16} />
                <span>Import Data</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
              <Link
                href="/"
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Eye size={16} />
                <span>View Site</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="col-span-3">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Sections</h2>
              <nav className="space-y-2">
                {sections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {section.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              {activeSection === 'personal' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Personal Information
                  </h2>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={data.personalInfo.fullName}
                        onChange={e =>
                          updatePersonalInfo('fullName', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={data.personalInfo.title}
                        onChange={e =>
                          updatePersonalInfo('title', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={data.personalInfo.email}
                        onChange={e =>
                          updatePersonalInfo('email', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={data.personalInfo.phone || ''}
                        onChange={e =>
                          updatePersonalInfo('phone', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="City"
                          value={data.personalInfo.location.city}
                          onChange={e =>
                            setData(prev => ({
                              ...prev,
                              personalInfo: {
                                ...prev.personalInfo,
                                location: {
                                  ...prev.personalInfo.location,
                                  city: e.target.value,
                                },
                              },
                            }))
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="Country"
                          value={data.personalInfo.location.country}
                          onChange={e =>
                            setData(prev => ({
                              ...prev,
                              personalInfo: {
                                ...prev.personalInfo,
                                location: {
                                  ...prev.personalInfo.location,
                                  country: e.target.value,
                                },
                              },
                            }))
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="Code"
                          value={data.personalInfo.location.countryCode}
                          onChange={e =>
                            setData(prev => ({
                              ...prev,
                              personalInfo: {
                                ...prev.personalInfo,
                                location: {
                                  ...prev.personalInfo.location,
                                  countryCode: e.target.value,
                                },
                              },
                            }))
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        LinkedIn URL
                      </label>
                      <input
                        type="url"
                        value={data.personalInfo.social.linkedin || ''}
                        onChange={e =>
                          setData(prev => ({
                            ...prev,
                            personalInfo: {
                              ...prev.personalInfo,
                              social: {
                                ...prev.personalInfo.social,
                                linkedin: e.target.value,
                              },
                            },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        GitHub URL
                      </label>
                      <input
                        type="url"
                        value={data.personalInfo.social.github || ''}
                        onChange={e =>
                          setData(prev => ({
                            ...prev,
                            personalInfo: {
                              ...prev.personalInfo,
                              social: {
                                ...prev.personalInfo.social,
                                github: e.target.value,
                              },
                            },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'summary' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Professional Summary
                  </h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Summary
                    </label>
                    <textarea
                      value={data.personalInfo.summary}
                      onChange={e => updateSummary(e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Write your professional summary..."
                    />
                  </div>
                </div>
              )}

              {activeSection === 'experience' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Experience
                  </h2>
                  <p className="text-gray-600">
                    Experience editing will be available in the next version.
                    For now, please edit the JSON file directly.
                  </p>
                </div>
              )}

              {activeSection === 'achievements' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Achievements
                  </h2>
                  <p className="text-gray-600">
                    Achievement editing will be available in the next version.
                    For now, please edit the JSON file directly.
                  </p>
                </div>
              )}

              {/* Other sections would be similar */}
              {!['personal', 'summary', 'experience', 'achievements'].includes(
                activeSection
              ) && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {sections.find(s => s.id === activeSection)?.label}
                  </h2>
                  <p className="text-gray-600">
                    This section editor will be available in the next version.
                    For now, please edit the JSON file directly.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
