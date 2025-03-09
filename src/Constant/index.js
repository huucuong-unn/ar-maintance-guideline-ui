// export const host = process.env.REACT_APP_BACKEND_APP_HOST_LOCAL;
// const host = process.env.REACT_APP_BACKEND_APP_HOST_DEPLOY;

//get all file from host, not just image
export const getImage = (image) => {
    return `${host}/api/v1/files/${image}`;
};

const hostImage = process.env.REACT_APP_BACKEND_APP_HOST_DEPLOY;
export const host = process.env.REACT_APP_BACKEND_APP_HOST_DEPLOY;
