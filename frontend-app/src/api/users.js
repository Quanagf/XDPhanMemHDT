const base = '/api/users';

const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${base}/upload-avatar`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: formData
  });

  if (!res.ok) {
    const errorData = await res.text();
    throw new Error(errorData || 'Failed to upload avatar');
  }

  return res.json();
}

export async function updateProfile(profileData) {
  const res = await fetch(`${base}/profile`, {
    method: 'PUT',
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(profileData)
  });

  if (!res.ok) {
    const errorData = await res.text();
    throw new Error(errorData || 'Failed to update profile');
  }

  return res.json();
}

export async function getProfile() {
  const res = await fetch(`${base}/profile`, {
    headers: getAuthHeader()
  });

  if (!res.ok) {
    throw new Error('Failed to fetch profile');
  }

  return res.json();
}

export async function changePassword(currentPassword, newPassword) {
  const res = await fetch(`${base}/change-password`, {
    method: 'POST',
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      currentPassword,
      newPassword
    })
  });

  if (!res.ok) {
    const errorData = await res.text();
    throw new Error(errorData || 'Failed to change password');
  }

  return res.text();
}

export async function deleteAccount() {
  const res = await fetch(`${base}/delete-account`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });

  if (!res.ok) {
    const errorData = await res.text();
    throw new Error(errorData || 'Failed to delete account');
  }

  return res.text();
}