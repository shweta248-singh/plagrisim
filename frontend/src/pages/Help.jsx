import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const Help = () => {
  const [activeCategory, setActiveCategory] = useState('General');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState(null);

  const faqData = {
    'General': [
      {
        question: "What is ProofNexa?",
        answer: "ProofNexa is a plagiarism detection platform that helps users check documents or pasted text for similarity and possible copied content."
      },
      {
        question: "Who can use ProofNexa?",
        answer: "Students, teachers, researchers, writers, and professionals can use ProofNexa to check originality before submitting or publishing content."
      },
      {
        question: "How do I use ProofNexa?",
        answer: "Login to your account, go to the scan/upload section, upload a PDF, DOCX, or TXT file or paste text, then start the analysis."
      },
      {
        question: "Do I need an account to use ProofNexa?",
        answer: "Yes, an account is required so your scans, reports, and history can be saved securely."
      },
      {
        question: "Is ProofNexa free to use?",
        answer: "The current version can support free usage depending on the project configuration. If plans are added later, they can be shown separately."
      },
      {
        question: "Is my data secure?",
        answer: "Yes, uploaded files and text are processed securely. Users can only access their own submissions and reports."
      },
      {
        question: "Does ProofNexa share my uploaded documents?",
        answer: "No, ProofNexa does not share uploaded documents with other users."
      },
      {
        question: "Can I view my previous scans?",
        answer: "Yes, your previous scans can be viewed from the History or Reports section if the analysis was saved successfully."
      },
      {
        question: "Can I edit my profile details?",
        answer: "Yes, go to Settings, open the General tab, edit your profile details such as name, email, and phone number, then save changes."
      },
      {
        question: "Can I change my password?",
        answer: "Yes, go to Settings, open the Security tab, enter your current password and new password, then update it."
      },
      {
        question: "What should I do if login fails?",
        answer: "Check that your email and password are correct. If the issue continues, make sure the backend server and database are running properly."
      },
      {
        question: "Why is my dashboard data empty?",
        answer: "Dashboard data may be empty if you have not uploaded or analyzed any document yet."
      },
      {
        question: "Why is the search not showing results?",
        answer: "Search only shows matching data from your own uploaded documents, reports, or history. Try searching by file name, status, score, or date."
      },
      {
        question: "Can I use ProofNexa on mobile?",
        answer: "Yes, the frontend should remain responsive and usable on desktop, tablet, and mobile screens."
      }
    ],
    'Plagiarism Check': [
      {
        question: "How does ProofNexa detect plagiarism?",
        answer: "ProofNexa extracts text from uploaded files or pasted input and analyzes similarity using NLP-based text comparison techniques."
      },
      {
        question: "Which file types are supported?",
        answer: "ProofNexa supports PDF, DOCX, and TXT files."
      },
      {
        question: "Can I paste text instead of uploading a file?",
        answer: "Yes, users can paste text directly if the paste-text scan option is available in the scan page."
      },
      {
        question: "What is similarity score?",
        answer: "Similarity score shows how much of the submitted content appears similar to existing text or stored comparison data."
      },
      {
        question: "What score is considered high plagiarism?",
        answer: "A higher similarity score usually means more matched or similar content. The exact interpretation depends on your institution or project rules."
      },
      {
        question: "Does a low similarity score mean the document is fully original?",
        answer: "A low score is a good sign, but it does not guarantee complete originality. Users should still review matched sections carefully."
      },
      {
        question: "Does ProofNexa highlight matched text?",
        answer: "If match data is available from the analysis engine, ProofNexa can show matched lines or sections in the report."
      },
      {
        question: "How long does analysis take?",
        answer: "Analysis time depends on document size, text length, backend performance, and NLP engine availability."
      },
      {
        question: "Why did my scan fail?",
        answer: "Scan may fail if the file type is unsupported, the file is too large, the backend is not running, or the NLP engine is unavailable."
      },
      {
        question: "Why is my PDF not readable?",
        answer: "Some PDFs are scanned images instead of selectable text. Text extraction may fail unless OCR support is added."
      },
      {
        question: "Can ProofNexa check handwritten notes?",
        answer: "Not in the basic version. Handwritten or image-based documents require OCR support."
      },
      {
        question: "Can ProofNexa detect paraphrased plagiarism?",
        answer: "ProofNexa can detect similarity using NLP methods, but deep paraphrase detection depends on the strength of the NLP model and dataset."
      },
      {
        question: "Can ProofNexa compare two documents?",
        answer: "If the compare-two-texts endpoint is enabled, ProofNexa can compare two text inputs and calculate similarity."
      },
      {
        question: "Is the plagiarism result 100% accurate?",
        answer: "No plagiarism checker can guarantee 100% accuracy. ProofNexa provides a similarity-based estimate to help users review originality."
      },
      {
        question: "Can I download the plagiarism report?",
        answer: "If report download is enabled in the Reports section, users can download or view their analysis results."
      },
      {
        question: "Will my uploaded file be saved?",
        answer: "The system may save submission details and analysis results for history/report viewing, depending on backend configuration."
      },
      {
        question: "What happens after I upload a file?",
        answer: "The backend extracts text from the file, sends it to the NLP engine for analysis, saves the result, and returns the report to the frontend."
      },
      {
        question: "What if the NLP engine is not running?",
        answer: "The scan/analyze request may fail. Make sure the NLP engine is running on http://127.0.0.1:8000."
      }
    ]
  };

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Filter FAQs based on search query
  const filteredFaqs = faqData[activeCategory].filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center">
          <HelpCircle className="w-6 h-6 mr-2 text-brand-purple" />
          Help & FAQ
        </h1>
        <p className="text-sm text-gray-500 mt-2">Find answers to common questions about ProofNexa.</p>
      </div>

      <div className="bg-[#111827]/80 backdrop-blur-xl rounded-2xl shadow-[0_0_30px_rgba(124,58,237,0.12)] border border-white/10 overflow-hidden text-slate-100">
        {/* TABS HEADER */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => { setActiveCategory('General'); setOpenIndex(null); }}
            className={`flex-1 py-4 text-sm font-semibold transition-colors focus:outline-none ${
              activeCategory === 'General'
                ? 'text-brand-purple border-b-2 border-brand-purple'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            General
          </button>
          <button
            onClick={() => { setActiveCategory('Plagiarism Check'); setOpenIndex(null); }}
            className={`flex-1 py-4 text-sm font-semibold transition-colors focus:outline-none ${
              activeCategory === 'Plagiarism Check'
                ? 'text-brand-purple border-b-2 border-brand-purple'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            Plagiarism Check
          </button>
        </div>

        <div className="p-8">
          {/* SEARCH BOX */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0B1020]/70 border border-white/10 text-slate-100 placeholder:text-slate-500 rounded-lg pl-10 pr-3 py-2.5 focus:ring-2 focus:ring-purple-500 outline-none transition-colors"
                placeholder={`Search in ${activeCategory}...`}
              />
            </div>
          </div>

          {/* FAQ ACCORDION */}
          {filteredFaqs.length > 0 ? (
            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => {
                const isOpen = openIndex === index;
                return (
                  <div 
                    key={index} 
                    className={`border border-white/10 rounded-xl overflow-hidden transition-all duration-200 ${isOpen ? 'ring-1 ring-brand-purple/20 bg-brand-purple/10' : 'bg-[#111827]/80 backdrop-blur-xl hover:border-purple-500/40 transition'}`}
                  >
                    <button
                      onClick={() => handleToggle(index)}
                      className="w-full px-6 py-4 flex items-center justify-between focus:outline-none"
                    >
                      <span className={`font-medium text-left ${isOpen ? 'text-brand-purple' : 'text-slate-100'}`}>
                        {faq.question}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-brand-purple flex-shrink-0 ml-4" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                      )}
                    </button>
                    
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                      <div className="px-6 pb-5 text-slate-300 leading-relaxed">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-[#0B1020] rounded-xl border border-white/10 border-dashed">
              <Search className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No matching FAQs found.</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your search terms</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Help;
