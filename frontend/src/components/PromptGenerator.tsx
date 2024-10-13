import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiSend, FiTwitter, FiLinkedin, FiFileText, FiGlobe, FiEye, FiCopy } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSpring, animated } from 'react-spring';
import lightLogo from '../assets/50.png';
import darkLogo from '../assets/40.png';

const AppContainer = styled.div`
  color: ${props => props.theme.text};
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  
  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

const Logo = styled.img`
  max-width: 200px;
  width: 100%;
  height: auto;
  margin-bottom: 2rem;
  
  @media (min-width: 768px) {
    max-width: 250px;
  }
  
  @media (min-width: 1024px) {
    max-width: 300px;
  }
`;

const Card = styled(motion.div)`
  background-color: ${props => props.theme.cardBackground};
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  width: 100%;
  max-width: 800px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
  border: 1px solid ${props => props.theme.border};
  background-color: ${props => props.theme.inputBackground};
  color: ${props => props.theme.text};
  font-size: 1rem;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.7rem top 50%;
  background-size: 1rem auto;
`;

const DropzoneContainer = styled.div`
  border: 2px dashed ${props => props.theme.border};
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${props => props.theme.primary};
  }
`;

const Button = styled(motion.button)`
  background-color: ${props => props.theme.primary};
  color: ${props => props.theme.buttonText};
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1rem;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.theme.secondary};
  }
`;

const Output = styled(motion.textarea)`
  width: 100%;
  height: 200px;
  padding: 0.75rem;
  margin-top: 1rem;
  border-radius: 0.5rem;
  border: 1px solid ${props => props.theme.border};
  background-color: ${props => props.theme.inputBackground};
  color: ${props => props.theme.text};
  resize: vertical;
  font-size: 1rem;
`;

const PlatformSelector = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  margin-bottom: 1rem;
  gap: 0.5rem;
`;

const PlatformButton = styled(motion.button)<{ isSelected: boolean }>`
  background-color: ${props => props.isSelected ? props.theme.primary : props.theme.cardBackground};
  color: ${props => props.isSelected ? props.theme.buttonText : props.theme.text};
  border: 1px solid ${props => props.theme.primary};
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 120px;

  &:hover {
    background-color: ${props => props.theme.primary};
    color: ${props => props.theme.buttonText};
  }

  @media (min-width: 768px) {
    font-size: 1rem;
  }
`;

const CharacterCount = styled.div<{ isOver: boolean }>`
  text-align: right;
  margin-top: 0.5rem;
  color: ${props => props.isOver ? props.theme.error : props.theme.text};
  font-size: 0.9rem;
`;

const PreviewContainer = styled.div`
  background-color: ${props => props.theme.previewBackground};
  border: 1px solid ${props => props.theme.border};
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 1rem;
`;

const PreviewTitle = styled.h3`
  margin-bottom: 1rem;
  color: ${props => props.theme.primary};
`;

const PreviewContent = styled.div`
  white-space: pre-wrap;
  font-size: 1rem;
  line-height: 1.5;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
`;

const platforms = [
  { name: 'Twitter', icon: FiTwitter, maxLength: 280 },
  { name: 'LinkedIn Post', icon: FiLinkedin, maxLength: 3000 },
  { name: 'LinkedIn Article', icon: FiFileText },
  { name: 'Blog', icon: FiGlobe },
];

interface PromptGeneratorProps {
  currentTheme: 'light' | 'dark';
}

const PromptGenerator: React.FC<PromptGeneratorProps> = ({ currentTheme }) => {
  const [promptFiles, setPromptFiles] = useState<string[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [trendUrl, setTrendUrl] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('Twitter');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    fetchPromptFiles();
  }, []);

  const fetchPromptFiles = async () => {
    try {
      const response = await fetch('/api/prompt-files');
      const data = await response.json();
      setPromptFiles(data.files);
    } catch (error) {
      toast.error('Failed to fetch prompt files');
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    setSelectedImage(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleGenerate = async () => {
    setIsLoading(true);

    const formData = new FormData();
    formData.append('prompt', selectedPrompt);
    formData.append('platform', selectedPlatform);
    if (selectedImage) {
      formData.append('image', selectedImage);
    }
    formData.append('trendUrl', trendUrl);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        setGeneratedContent(data.content);
        toast.success('Content generated successfully!');
      }
    } catch (error) {
      toast.error('Failed to generate content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    toast.success('Content copied to clipboard!');
  };

  const buttonAnimation = useSpring({
    scale: isLoading ? 0.95 : 1,
    config: { tension: 300, friction: 10 },
  });

  const getCharacterCount = () => {
    const platform = platforms.find(p => p.name === selectedPlatform);
    if (platform && platform.maxLength) {
      const count = generatedContent.length;
      const remaining = platform.maxLength - count;
      const isOver = remaining < 0;
      return (
        <CharacterCount isOver={isOver}>
          {isOver ? 'Exceeded by ' : 'Remaining: '}{Math.abs(remaining)} characters
        </CharacterCount>
      );
    }
    return null;
  };

  return (
    <AppContainer>
      <Logo src={currentTheme === 'dark' ? darkLogo : lightLogo} alt="QuickPost Logo" />
      <Card
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <PlatformSelector>
          {platforms.map((platform) => (
            <PlatformButton
              key={platform.name}
              isSelected={selectedPlatform === platform.name}
              onClick={() => setSelectedPlatform(platform.name)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <platform.icon style={{ marginRight: '0.5rem' }} />
              {platform.name}
            </PlatformButton>
          ))}
        </PlatformSelector>

        <Select
          value={selectedPrompt}
          onChange={(e) => setSelectedPrompt(e.target.value)}
        >
          <option value="" disabled>Select a prompt file</option>
          {promptFiles.map((file) => (
            <option key={file} value={file}>{file}</option>
          ))}
        </Select>

        <DropzoneContainer {...getRootProps()}>
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the image here ...</p>
          ) : (
            <p>Drag 'n' drop an image here, or click to select one</p>
          )}
          <FiUpload size={24} style={{ marginTop: '1rem' }} />
        </DropzoneContainer>
        {selectedImage && <p>Selected: {selectedImage.name}</p>}

        <Select
          value={trendUrl}
          onChange={(e) => setTrendUrl(e.target.value)}
        >
          <option value="" disabled>Select Trend URL</option>
          <option value="https://twitter-trends.iamrohit.in/">Global Trends</option>
          <option value="https://twitter-trends.iamrohit.in/south-africa/johannesburg">Johannesburg Trends</option>
          <option value="https://twitter-trends.iamrohit.in/united-states">US Trends</option>
          <option value="https://twitter-trends.iamrohit.in/united-arab-emirates">UAE Trends</option>
          <option value="https://twitter-trends.iamrohit.in/united-kingdom">UK Trends</option>
        </Select>

        <ButtonGroup>
          <Button
            as={animated.button}
            style={buttonAnimation}
            onClick={handleGenerate}
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLoading ? 'Generating...' : 'Generate Content'}
            <FiSend style={{ marginLeft: '0.5rem' }} />
          </Button>
          <Button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isPreviewMode ? 'Edit Mode' : 'Preview Mode'}
            <FiEye style={{ marginLeft: '0.5rem' }} />
          </Button>
          <Button
            onClick={handleCopy}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Copy Content
            <FiCopy style={{ marginLeft: '0.5rem' }} />
          </Button>
        </ButtonGroup>

        {isPreviewMode ? (
          <PreviewContainer>
            <PreviewTitle>{selectedPlatform} Preview</PreviewTitle>
            <PreviewContent>{generatedContent}</PreviewContent>
          </PreviewContainer>
        ) : (
          <>
            <Output
              placeholder={`Generated ${selectedPlatform} content will appear here...`}
              value={generatedContent}
              onChange={(e) => setGeneratedContent(e.target.value)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
            {getCharacterCount()}
          </>
        )}
      </Card>
      <ToastContainer position="bottom-right" />
    </AppContainer>
  );
};

export default PromptGenerator;
