import { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Button,
    Box,
    TextField,
    MenuItem,
    Grid,
    Input,
    CircularProgress,
    IconButton,
    Typography
} from '@mui/material';
import { Editor } from '@tinymce/tinymce-react';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DOMPurify from 'dompurify';
import './home.css';
import './CreateSubchapter.css';
import { useAppState } from '../overmind';

export default function EditSubchapter() {
    const location = useLocation();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [subchapTitle, setSubchapTitle] = useState('');
    const [chapSelected, setChapSelected] = useState('');
    const [chaps, setChaps] = useState([]);
    const [thumbnail, setThumbnail] = useState('');
    const [base64Thumbnail, setBase64Thumbnail] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [content, setContent] = useState('');

    const userState = useAppState().user;
    const userId = userState.currentUser.googleId;
    const BASE_URL = import.meta.env.VITE_API_URL;
    const chapterId = location.state.parentChapterId;
    const subchapterId = location.state.parentSubchapterId;

    console.log("user id: ", userId);

    useEffect(() => {
        const fetchData = async () => {
            await axios.get(BASE_URL + '/chapters/').then((res) => {
                setChaps(res.data);
            });
        };
        const getSubchapterContent = async (chapterId, subchapterId) => {
            axios.get(`${BASE_URL}/chapters/${chapterId}/subchapters/${subchapterId}`)
            .then(res => {
                console.log("data",res.data)
                setSubchapTitle(res.data.subchapterTitle);
                setChapSelected(res.data.chapterId);
                setContent(res.data.content);
                setThumbnail({"name": res.data.thumbnail});
            })
        }
        fetchData();
        getSubchapterContent(chapterId, subchapterId)
    }, []);

    const handleEditorChange = (content, editor) => {
        setContent(content);
    };

    async function addSubchapter() {
        console.log(DOMPurify.sanitize(content));
        setErrorMessage(""); // initialize error message
        setLoading(true);
        if (chapSelected == undefined || chapSelected == '' || chapSelected == null) {
            setLoading(false);
            setErrorMessage("Fields cannot be empty");
            return;
        }
        console.log(
            {
                subchapterTitle: subchapTitle,
                thumbnail: base64Thumbnail,
                content: DOMPurify.sanitize(content),
                lastModifiedUserID: userId,
                selectedChapter: chapSelected
            }

        )
        await axios
            .put(BASE_URL + '/chapters/' + chapterId + '/subchapters/' + subchapterId+'/', {
                subchapterTitle: subchapTitle,
                thumbnail: base64Thumbnail,
                content: DOMPurify.sanitize(content),
                lastModifiedUserID: userId,
                selectedChapter: chapSelected
            })
            .then(() => {
                setLoading(false);
                navigate("/chapters/"+chapSelected+"/subchapters");
            })
            .catch((error) => {
                setLoading(false);
                console.log("error",error);
                
                if (error.response.status == 404) {
                    setErrorMessage(error.response.data.msg);
                    return;
                }
                setErrorMessage(error.response.data.msg);
            });
    }

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];

        // convert file to base64 string
        const base64String = await convertToBase64(file);

        // check image size is less than 1~2mb
        // convert base64 string to Blob object
        const byteString = atob(base64String.split(',')[1]);
        const mimeType = base64String.split(",")[0].split(":")[1].split(";")[0];
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uint8Array = new Uint8Array(arrayBuffer);

        for (let i = 0; i < byteString.length; i++) {
            uint8Array[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([arrayBuffer], { type: mimeType });
        
        // Check if Blob size is bigger than 2MB
        if (blob.size / 1024 / 1024 > 2) {
            alert("The image size exceeds 2MB. Please upload an image with a size smaller than 2MB.");
            return;
        } 

        // Image size is less than 2MB
        console.log("Image size is less than 2MB: ", file);
        setThumbnail(file);
        setBase64Thumbnail(base64String);
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);

            fileReader.onload = () => {
                resolve(fileReader.result);
            };

            fileReader.onerror = (error) => {
                reject(error);
            };
        });
    };

    return (
        <div className='home'>
            {loading ? (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100vh',
                        width: '200px',
                        margin: '0 auto',
                    }}
                >
                    <CircularProgress color='info' size={40} thickness={4} />
                </Box>
            ) : (
                <div className='homeContainer'>
                    <div className='pageTitle'>
                        <Grid pb={2} display="flex" alignItems="center" mb={1}>
                            <IconButton onClick={
                                () => { navigate(-1) }}>
                                <ArrowBackIcon />
                            </IconButton>
                            <Typography style={{fontSize: '25px', fontWeight: 'bold'}}>
                                Edit Subchapter
                            </Typography>
                        </Grid>
                        {/* <p className='fs-1 fw-bold'>Add Subchapter</p> */}
                    </div>
                    <div className="errorMessage">
                        {errorMessage}
                    </div>
                    <Grid item xs={6} sm={12} lg={12}>
                        <Box
                            component='form'
                            sx={{
                                '& .MuiTextField-root': {
                                    width: '101ch',
                                    marginTop: '2ch',
                                },
                            }}
                        >
                            <TextField
                                label='Title'
                                variant='outlined'
                                value={subchapTitle}
                                onChange={(event) =>
                                    setSubchapTitle(event.target.value)
                                }
                                error={subchapTitle.length < 1}
                                helperText={subchapTitle.length < 1 ? 'Title cannot be empty' : ''}
                            ></TextField>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={12} lg={12}>
                        <Box
                            sx={{
                                marginTop: '2ch',
                            }}
                        >
                            <Input
                                type='file'
                                className='inputThumbnail'
                                inputProps={{ accept: 'image/*' }}
                                id='file-upload'
                                onChange={(e) => handleFileUpload(e)}
                                sx={{
                                    display: 'none',
                                }}
                            />
                            <label htmlFor='file-upload'>
                                <Button
                                    startIcon={<CloudUploadIcon />}
                                    component='span'
                                    variant='outlined'
                                    sx={{
                                        // color: 'white',
                                        backgroundColor: 'white', // Set background color on hover
                                        borderColor: '#41ADA4 !important', // Set border color on hover
                                        color: '#41ADA4',
                                        '&:hover': {
                                            backgroundColor: '#41ADA4',
                                            borderColor: '#41ADA4',
                                            color: 'white',
                                        },
                                    }}
                                >
                                    Choose Thumbnail
                                </Button>
                            </label>
                            {thumbnail && (
                                <span className='fileName'>
                                    {thumbnail.name}
                                </span>
                            )}
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={12} lg={12}>
                        <Box
                            component='form'
                            sx={{
                                '& .MuiTextField-root': {
                                    width: '25ch',
                                    marginTop: '2ch',
                                },
                            }}
                        >
                            <TextField
                                value={chapSelected}
                                onChange={(event) =>
                                    setChapSelected(event.target.value)
                                }
                                select
                                label='Parent chapter'
                                error={chapSelected.length < 1}
                                helperText={chapSelected.length < 1 ? 'Parent chapter cannot be empty' : ''}
                            >
                                {chaps.map((option) => (
                                    <MenuItem
                                        key={option._id}
                                        value={option._id}
                                    >
                                        {option.title}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={12} lg={12}>
                        <Box
                            sx={{
                                marginTop: '2ch',
                            }}
                        >
                            <Editor
                                apiKey={
                                    import.meta.env
                                        .VITE_REACT_AP_TINYMCE_API_KEY
                                }
                                value={content}
                                init={{
                                    height: 500,
                                    width: 900,
                                    menubar: 'insert',
                                    file_picker_types: 'image',
                                    plugins:
                                        'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
                                    toolbar:
                                        'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
                                    content_style:
                                        'body { font-family:Arial,Helvetica,sans-serif; font-size:14px }',
                                }}
                                onEditorChange={handleEditorChange}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={12} lg={12}>
                        <Box
                            sx={{
                                marginTop: '5ch',
                            }}
                        >
                            <Button
                                variant='outlined'
                                onClick={() => {
                                    addSubchapter();
                                }}
                                component='span'
                                sx={{
                                    color: 'white',
                                    backgroundColor: '#41ADA4',
                                    borderColor: '#41ADA4',
                                    '&:hover': {
                                        backgroundColor: 'white', // Set background color on hover
                                        borderColor: '#41ADA4 !important', // Set border color on hover
                                        color: '#41ADA4',
                                    },
                                    '&.Mui-disabled': {
                                        backgroundColor: '#98d8d3',
                                        color: 'white',
                                        borderColor: '#98d8d3',
                                    }
                                }}
                                disabled={
                                    subchapTitle.length < 1 ||
                                    chapSelected.length < 1
                                }
                            >
                                Save
                            </Button>
                        </Box>
                    </Grid>
                </div>
            )}
        </div>
    );
}
