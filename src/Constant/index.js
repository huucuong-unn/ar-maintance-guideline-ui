// export const host = process.env.REACT_APP_BACKEND_APP_HOST_LOCAL;
// const host = process.env.REACT_APP_BACKEND_APP_HOST_DEPLOY;

//get all file from host, not just image
export const getImage = (image) => {
    return `${host}/api/v1/files/${image}`;
};

export const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
    const year = date.getFullYear();

    return `${month}/${day}/${year}`;
};

export const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
};

export const host = process.env.REACT_APP_BACKEND_APP_HOST_LOCAL;
