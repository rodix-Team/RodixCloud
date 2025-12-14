'use client';

import styled from 'styled-components';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import {
    selectAllAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
} from '../../../redux/slices/addressesSlice';
import ProtectedRoute from '../../../components/ProtectedRoute';
import toast from 'react-hot-toast';

const Container = styled.div`
  max-width: 900px;
  margin: 3rem auto;
  padding: 0 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
`;

const AddButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: #d17834;
  }
`;

const AddressList = styled.div`
  display: grid;
  gap: 1.5rem;
`;

const AddressCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  border: 2px solid ${({ $isDefault, theme }) =>
        $isDefault ? theme.colors.primary : 'transparent'};
`;

const DefaultBadge = styled.span`
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
`;

const AddressInfo = styled.div`
  margin-bottom: 1rem;

  h3 {
    color: ${({ theme }) => theme.colors.textPrimary};
    margin-bottom: 0.5rem;
  }

  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    margin: 0.25rem 0;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: none;

  ${({ $variant }) => {
        if ($variant === 'default') return `
      background: #10b981;
      color: white;
      &:hover { background: #059669; }
    `;
        if ($variant === 'edit') return `
      background: #3b82f6;
      color: white;
      &:hover { background: #2563eb; }
    `;
        if ($variant === 'delete') return `
      background: #ef4444;
      color: white;
      &:hover { background: #dc2626; }
    `;
    }}
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 600;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Textarea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  flex: 1;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: none;

  ${({ $variant }) => {
        if ($variant === 'primary') return `
      background: ${({ theme }) => theme.colors.primary};
      color: white;
      &:hover { background: #d17834; }
    `;
        return `
      background: #e0e0e0;
      color: ${({ theme }) => theme.colors.textPrimary};
      &:hover { background: #d0d0d0; }
    `;
    }}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${({ theme }) => theme.colors.textSecondary};

  h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.1rem;
    margin-bottom: 2rem;
  }
`;

export default function AddressesPage() {
    const router = useRouter();
    const dispatch = useDispatch();
    const addresses = useSelector(selectAllAddresses);

    const [showModal, setShowModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        city: ''
    });

    const handleAdd = () => {
        setEditingAddress(null);
        setFormData({ name: '', phone: '', address: '', city: '' });
        setShowModal(true);
    };

    const handleEdit = (address) => {
        setEditingAddress(address);
        setFormData({
            name: address.name,
            phone: address.phone,
            address: address.address,
            city: address.city
        });
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (confirm('هل أنت متأكد من حذف هذا العنوان؟')) {
            dispatch(deleteAddress(id));
            toast.success('تم حذف العنوان');
        }
    };

    const handleSetDefault = (id) => {
        dispatch(setDefaultAddress(id));
        toast.success('تم تعيين العنوان الافتراضي');
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.name || !formData.phone || !formData.address || !formData.city) {
            toast.error('جميع الحقول مطلوبة');
            return;
        }

        if (editingAddress) {
            dispatch(updateAddress({ id: editingAddress.id, ...formData }));
            toast.success('تم تحديث العنوان');
        } else {
            dispatch(addAddress(formData));
            toast.success('تم إضافة العنوان');
        }

        setShowModal(false);
    };

    return (
        <ProtectedRoute>
            <Container>
                <Header>
                    <Title>📍 عناويني</Title>
                    <AddButton onClick={handleAdd}>
                        ➕ إضافة عنوان جديد
                    </AddButton>
                </Header>

                {addresses.length === 0 ? (
                    <EmptyState>
                        <h2>😔 لا توجد عناوين</h2>
                        <p>لم تقم بإضافة أي عنوان بعد</p>
                        <AddButton onClick={handleAdd}>
                            إضافة عنوان الآن
                        </AddButton>
                    </EmptyState>
                ) : (
                    <AddressList>
                        {addresses.map(address => (
                            <AddressCard key={address.id} $isDefault={address.isDefault}>
                                {address.isDefault && <DefaultBadge>افتراضي</DefaultBadge>}

                                <AddressInfo>
                                    <h3>{address.name}</h3>
                                    <p>📱 {address.phone}</p>
                                    <p>📍 {address.address}</p>
                                    <p>🏙️ {address.city}</p>
                                </AddressInfo>

                                <Actions>
                                    {!address.isDefault && (
                                        <ActionButton
                                            $variant="default"
                                            onClick={() => handleSetDefault(address.id)}
                                        >
                                            ⭐ جعله افتراضي
                                        </ActionButton>
                                    )}
                                    <ActionButton
                                        $variant="edit"
                                        onClick={() => handleEdit(address)}
                                    >
                                        ✏️ تعديل
                                    </ActionButton>
                                    <ActionButton
                                        $variant="delete"
                                        onClick={() => handleDelete(address.id)}
                                    >
                                        🗑️ حذف
                                    </ActionButton>
                                </Actions>
                            </AddressCard>
                        ))}
                    </AddressList>
                )}

                {/* Add/Edit Modal */}
                {showModal && (
                    <Modal onClick={() => setShowModal(false)}>
                        <ModalContent onClick={(e) => e.stopPropagation()}>
                            <ModalTitle>
                                {editingAddress ? 'تعديل العنوان' : 'إضافة عنوان جديد'}
                            </ModalTitle>

                            <Form onSubmit={handleSubmit}>
                                <FormGroup>
                                    <Label>الاسم الكامل *</Label>
                                    <Input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="أدخل اسمك الكامل"
                                        required
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <Label>رقم الهاتف *</Label>
                                    <Input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="0612345678"
                                        required
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <Label>العنوان الكامل *</Label>
                                    <Textarea
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="الشارع، الحي، الرقم..."
                                        required
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <Label>المدينة *</Label>
                                    <Input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        placeholder="مثال: الدار البيضاء"
                                        required
                                    />
                                </FormGroup>

                                <ButtonGroup>
                                    <Button type="submit" $variant="primary">
                                        {editingAddress ? 'حفظ التغييرات' : 'إضافة العنوان'}
                                    </Button>
                                    <Button type="button" onClick={() => setShowModal(false)}>
                                        إلغاء
                                    </Button>
                                </ButtonGroup>
                            </Form>
                        </ModalContent>
                    </Modal>
                )}
            </Container>
        </ProtectedRoute>
    );
}
