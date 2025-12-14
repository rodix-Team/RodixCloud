'use client';

import styled from 'styled-components';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// -----------------
// STYLED COMPONENTS
// -----------------
const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #FFF8E1 0%, #f9f9f9 100%);
  padding: 3rem 1rem;

  @media (max-width: 768px) {
    padding: 2rem 1rem;
  }
`;

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #222;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
`;

// Avatar Upload Section
const AvatarSection = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 3rem 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  text-align: center;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
  }
`;

const AvatarContainer = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  margin: 0 auto 2rem;
`;

const AvatarPreview = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: ${({ $hasImage }) =>
    $hasImage
      ? 'transparent'
      : 'linear-gradient(135deg, #F4A300, #FFB82E)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  color: white;
  font-weight: bold;
  box-shadow: 0 10px 30px rgba(244, 163, 0, 0.3);
  border: 5px solid white;
  overflow: hidden;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &:hover .overlay {
    opacity: 1;
  }
`;

const AvatarOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  cursor: pointer;
  color: white;
  font-size: 2rem;
`;

const UploadButton = styled.label`
  background: linear-gradient(135deg, #F4A300, #FFB82E);
  color: white;
  padding: 0.9rem 2rem;
  border-radius: 50px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-block;
  box-shadow: 0 6px 20px rgba(244, 163, 0, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(244, 163, 0, 0.4);
  }

  input {
    display: none;
  }
`;

// Form Sections
const FormCard = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #222;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 1rem;
  border-bottom: 3px solid #F4A300;

  .icon {
    font-size: 1.8rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: ${({ $columns }) => $columns || '1fr'};
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  .required {
    color: #ff4757;
  }
`;

const Input = styled.input`
  padding: 1rem 1.2rem;
  border: 2px solid ${({ $error }) => ($error ? '#ff4757' : '#eee')};
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s;
  background: #fafafa;

  &:focus {
    outline: none;
    border-color: ${({ $error }) => ($error ? '#ff4757' : '#F4A300')};
    background: white;
    box-shadow: 0 0 0 4px ${({ $error }) =>
    $error ? 'rgba(255, 71, 87, 0.1)' : 'rgba(244, 163, 0, 0.1)'};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled(motion.span)`
  color: #ff4757;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const HelpText = styled.span`
  color: #999;
  font-size: 0.85rem;
`;

// Toggle Switch
const ToggleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem;
  background: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 1rem;
`;

const ToggleLabel = styled.div`
  h4 {
    margin: 0 0 0.25rem 0;
    color: #222;
    font-size: 1rem;
  }

  p {
    margin: 0;
    color: #666;
    font-size: 0.85rem;
  }
`;

const ToggleSwitch = styled.label`
  position: relative;
  width: 60px;
  height: 32px;
  display: inline-block;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.3s;
    border-radius: 34px;

    &:before {
      position: absolute;
      content: '';
      height: 24px;
      width: 24px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
    }
  }

  input:checked + .slider {
    background-color: #10b981;
  }

  input:checked + .slider:before {
    transform: translateX(28px);
  }
`;

// Action Buttons
const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Button = styled(motion.button)`
  flex: 1;
  padding: 1.1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SaveButton = styled(Button)`
  background: linear-gradient(135deg, #F4A300 0%, #FFB82E 100%);
  color: white;
  box-shadow: 0 6px 20px rgba(244, 163, 0, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(244, 163, 0, 0.4);
  }
`;

const CancelButton = styled(Button)`
  background: #f5f5f5;
  color: #333;

  &:hover:not(:disabled) {
    background: #e0e0e0;
  }
`;

// Success Message
const SuccessMessage = styled(motion.div)`
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 1.2rem 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);

  .icon {
    font-size: 1.8rem;
  }

  .content {
    flex: 1;

    h3 {
      margin: 0 0 0.25rem 0;
      font-size: 1.1rem;
    }

    p {
      margin: 0;
      font-size: 0.9rem;
      opacity: 0.9;
    }
  }
`;

// -----------------
// MAIN COMPONENT
// -----------------
export default function EditProfilePage() {
  const router = useRouter();
  const { currentUser, updateUserProfile } = useAuth();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    displayName: currentUser?.displayName || '',
    email: currentUser?.email || '',
    phone: '',
    bio: ''
  });
  const [errors, setErrors] = useState({});
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    newsletter: true
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleToggle = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'الاسم مطلوب';
    } else if (formData.displayName.length < 3) {
      newErrors.displayName = 'الاسم يجب أن يكون 3 أحرف على الأقل';
    }

    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'رقم الهاتف غير صحيح (10 أرقام)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('⚠️ يرجى تصحيح الأخطاء');
      return;
    }

    setLoading(true);

    try {
      // Update only display name
      await updateUserProfile(formData.displayName, null);

      setSuccess(true);
      toast.success('✅ تم حفظ التغييرات بنجاح!');

      setTimeout(() => {
        setSuccess(false);
      }, 5000);

    } catch (error) {
      console.error('Update error:', error);
      toast.error('❌ حدث خطأ أثناء الحفظ');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    router.push('/login');
    return null;
  }

  const userInitial = formData.displayName?.charAt(0).toUpperCase() || currentUser.email?.charAt(0).toUpperCase() || '👤';

  return (
    <PageWrapper>
      <Container>
        <Header>
          <Title>تعديل الملف الشخصي ⚙️</Title>
          <Subtitle>قم بتحديث معلوماتك الشخصية</Subtitle>
        </Header>

        {/* Success Message */}
        <AnimatePresence>
          {success && (
            <SuccessMessage
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="icon">✓</div>
              <div className="content">
                <h3>تم الحفظ بنجاح!</h3>
                <p>تم تحديث معلوماتك الشخصية</p>
              </div>
            </SuccessMessage>
          )}
        </AnimatePresence>

        {/* Personal Information */}
        <FormCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SectionTitle>
            <span className="icon">👤</span>
            المعلومات الشخصية
          </SectionTitle>

          <Form onSubmit={handleSubmit}>
            <FormRow $columns="1fr 1fr">
              <FormGroup>
                <Label>
                  الاسم الكامل
                  <span className="required">*</span>
                </Label>
                <Input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  $error={errors.displayName}
                  placeholder="أدخل اسمك الكامل"
                />
                <AnimatePresence>
                  {errors.displayName && (
                    <ErrorMessage
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      ⚠️ {errors.displayName}
                    </ErrorMessage>
                  )}
                </AnimatePresence>
              </FormGroup>

              <FormGroup>
                <Label>رقم الهاتف</Label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  $error={errors.phone}
                  placeholder="0612345678"
                />
                <AnimatePresence>
                  {errors.phone && (
                    <ErrorMessage
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      ⚠️ {errors.phone}
                    </ErrorMessage>
                  )}
                </AnimatePresence>
              </FormGroup>
            </FormRow>

            <FormGroup>
              <Label>البريد الإلكتروني</Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                disabled
                placeholder="example@email.com"
              />
              <HelpText>⚠️ لا يمكن تغيير البريد الإلكتروني</HelpText>
            </FormGroup>

            <FormGroup>
              <Label>نبذة عني (اختياري)</Label>
              <Input
                as="textarea"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="اكتب نبذة مختصرة عنك..."
                rows="4"
                style={{ resize: 'vertical', minHeight: '100px' }}
              />
            </FormGroup>
          </Form>
        </FormCard>

        {/* Preferences */}
        <FormCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SectionTitle>
            <span className="icon">🔔</span>
            إعدادات الإشعارات
          </SectionTitle>

          <ToggleContainer>
            <ToggleLabel>
              <h4>إشعارات البريد الإلكتروني</h4>
              <p>تلقي تحديثات الطلبات عبر البريد</p>
            </ToggleLabel>
            <ToggleSwitch>
              <input
                type="checkbox"
                checked={preferences.emailNotifications}
                onChange={() => handleToggle('emailNotifications')}
              />
              <span className="slider"></span>
            </ToggleSwitch>
          </ToggleContainer>

          <ToggleContainer>
            <ToggleLabel>
              <h4>إشعارات SMS</h4>
              <p>تلقي رسائل نصية عند الشحن</p>
            </ToggleLabel>
            <ToggleSwitch>
              <input
                type="checkbox"
                checked={preferences.smsNotifications}
                onChange={() => handleToggle('smsNotifications')}
              />
              <span className="slider"></span>
            </ToggleSwitch>
          </ToggleContainer>

          <ToggleContainer>
            <ToggleLabel>
              <h4>النشرة الإخبارية</h4>
              <p>تلقي عروض حصرية ونصائح</p>
            </ToggleLabel>
            <ToggleSwitch>
              <input
                type="checkbox"
                checked={preferences.newsletter}
                onChange={() => handleToggle('newsletter')}
              />
              <span className="slider"></span>
            </ToggleSwitch>
          </ToggleContainer>
        </FormCard>

        {/* Action Buttons */}
        <ButtonGroup>
          <CancelButton
            type="button"
            onClick={() => router.push('/profile')}
            whileTap={{ scale: 0.98 }}
          >
            ← إلغاء
          </CancelButton>
          <SaveButton
            onClick={handleSubmit}
            disabled={loading}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? '⏳ جاري الحفظ...' : '✓ حفظ التغييرات'}
          </SaveButton>
        </ButtonGroup>
      </Container>
    </PageWrapper>
  );
}
