import React from 'react';
import { Typography, Button, IconButton, Stack, Grid, Box } from '@mui/material';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link, useParams } from 'react-router-dom';
import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SubchapterCard from '../components/subchapters/SubchapterCard';
import { useAppState, useActions } from '../overmind';
import { trim } from 'lodash';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CircularProgress from '@mui/material/CircularProgress';
import ScrollUpButton from '../components/scrollUpBtn/ScrollUpButton';

const Subchapters = ({ searchInput }) => {

    
    const location = useLocation();
    const navigate = useNavigate();
    const { chapterId } = useParams();

    // overmind states
    const chapterState = useAppState().chapters;
    const subchapterState = useAppState().subchapters
    const userState = useAppState().user
    const userType = userState.currentUser.userType
    
    // overmind actions
    const subchapterActions = useActions().subchapters
    const chapterActions = useActions().chapters

    // get current chapter from overmind state
    const currentChapter = chapterState.selectedChapter
    // const currentChapterID = chapterState.selectedChapter.currentChapterId
    const currentChapterID = location.pathname.split('/')[2]
    if (currentChapter == null) {
        axios.get(import.meta.env.VITE_API_URL + "/chapters/" + currentChapterID)
        .then(res=> {
            console.log(res.data)
            chapterActions.setSelectedChapter(res.data)
        }).catch(err=> {
            console.error(err)
        })
    }
    
    // extract currentUser from session storage
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser"))
    // const userId = currentUser._id

    const userId = userState.currentUser.googleId;

    let filtered = [];

    // useStates
    const [loading, setLoading] = useState(false);

    const BASE_URL = import.meta.env.VITE_API_URL

    const [showScrollButton, setShowScrollButton] = useState(false);

    if (!currentChapter) {
        console.log("There is no current chapter in overmind")
        console.log("This is the chapter Id in the URL", chapterId)

        let selectedChapter = {}

        axios.get(BASE_URL + "/chapters/" + chapterId)
        .then(res=> {
            console.log(res.data)

            selectedChapter.currentChapterIcon = res.data.chapterIcon
            selectedChapter.currentChapterId = res.data._id
            selectedChapter.currentChapterTitle = res.data.title

            console.log(selectedChapter)
            chapterActions.setSelectedChapter(selectedChapter)
            sessionStorage.setItem("currentChapterId", res.data._id)
            sessionStorage.setItem('selectedChapter', JSON.stringify(selectedChapter));

            console.log(chapterState.selectedChapter)
        }).catch(err=>{
            console.err
        })
    }
    
    useEffect(() => {
        // if currentChapter does not exist, then reroute to the chapters page.
        // if (!currentChapter || !userId) {
        //     navigate(`/Chapters`);
        //     return;
        // }

        // extract currentchapter details
        // const chapterId = currentChapter.currentChapterId
        setLoading(true)
        subchapterActions.loadAllSubchaptersWithUserId({chapterId, userId})
        setLoading(false)

        const handleScroll = () => {
            if (window.scrollY > 100) {
              setShowScrollButton(true);
            } else {
              setShowScrollButton(false);
            }
          };
      
          window.addEventListener("scroll", handleScroll);
      
          return () => {
            window.removeEventListener("scroll", handleScroll);
          };
    }, [])

    //button's styling
    const styles = {
        button: {
            // color: 'white',
            backgroundColor: 'white',
            borderColor: '#41ADA4 !important',
            color: '#41ADA4',
            '&:hover': {
                backgroundColor: '#41ADA4',
                borderColor: '#41ADA4',
                color: 'white',
            },
            '@media (max-width: 600px)': {
                padding: '5px',
                fontSize: '13px',
            },
        },
    };
 
    const [anchorEl, setAnchorEl] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
  
    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };
  
    const handleClose = () => {
      setAnchorEl(null);
    };
  
    const handleWindowSizeChange = () => {
      setIsMobile(window.innerWidth < 1080);
    };
  
    useEffect(() => {
      setIsMobile(window.innerWidth < 1080);
      window.addEventListener("resize", handleWindowSizeChange);
      return () => {
        window.removeEventListener("resize", handleWindowSizeChange);
      };
    }, []);

    function toTwemoji(string) {
        return twemoji.parse(string)
    };

    const searchSubchapters = (searchInput, subchapter) => {
        
        let rgx = "?![^<>]*>";
        const regex = new RegExp(`(${trim(searchInput)})(${rgx})`, 'gi');
        if (searchInput == "") {
            return subchapter
        } 
        else if (
            
            subchapter.subchapterTitle.toLowerCase().includes(searchInput.toLowerCase()) || 
            regex.test(subchapter.content) ){

            return subchapter
        }
    };


    async function deleteChapter(){
        
        if (confirm("Are you sure you want to delete this chapter?")) {
            await axios.delete(
                BASE_URL + `/chapters/` + currentChapterID , {
                    withCredentials: true
                }
            ).then(
                res => {
                    alert("Chapter deleted successfully!")
                    window.location.href = "/Chapters"
                    
                }
            ).catch(
                err => {
                    if (err.response.status == 401) {
                        alert("You are not authorized to perform this action")
                    }
                    // return 500
                    else if(err.response.status == 500) {
                        navigate("/500");
                    } else if(err.response.status == 404) {
                        navigate("/404");
                    } else {
                        navigate("/other-errors");
                    }
                }
            )}
    }

    filtered = subchapterState.subchapterlist.filter((subchapter) => searchSubchapters(searchInput, subchapter))

    if (!currentChapter) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '200px',
                    margin: '0 auto',
                }}
            >
                <CircularProgress color='info' size={40} thickness={4} />
            </Box>
        )
    }

    return (
        <Box margin={4}>
            {showScrollButton && <ScrollUpButton />}
            <Grid pb={2} display="flex" alignItems="center" mb={1}>
                <IconButton onClick={
                    () => { navigate('/Chapters') }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography pr={2} style={{fontSize: '25px', fontWeight: 'bold'}}>
                    <span dangerouslySetInnerHTML={{__html: toTwemoji(chapterState.selectedChapter.currentChapterIcon)}}></span> {chapterState.selectedChapter.currentChapterTitle}
                </Typography>

                <React.Fragment>
                    {userType !== "junior" ? (
                        isMobile ? (
                        <Stack direction="row" spacing={2} ml="auto">
                            <IconButton onClick={handleClick} size="large" sx={styles.button}>
                            <MoreVertIcon />
                            </IconButton>
                            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                            <MenuItem
                                onClick={() => {
                                deleteChapter();
                                handleClose();
                                }}
                            >
                                <DeleteOutlinedIcon />
                                Delete chapter
                            </MenuItem>
                            <MenuItem
                                onClick={() => {
                                navigate(`/Chapters/${currentChapter.currentChapterId}/EditChapter`, {
                                    state: {
                                    chapterId: currentChapter.currentChapterId,
                                    chapterTitle: chapterState.selectedChapter.currentChapterTitle,
                                    chapterIcon: chapterState.selectedChapter.currentChapterIcon,
                                    },
                                });
                                handleClose();
                                }}
                            >
                                <EditIcon />
                                Edit chapter
                            </MenuItem>
                            <MenuItem component={Link} to="/CreateSubchapter">
                                <AddIcon />
                                Create subchapter
                            </MenuItem>
                            </Menu>
                        </Stack>
                        ) : (
                        <Stack direction="row" spacing={2} ml="auto">
                            <Button
                            onClick={(e) => {
                                deleteChapter();
                            }}
                            variant="outlined"
                            sx={styles.button}
                            >
                            <DeleteOutlinedIcon />
                            Delete chapter
                            </Button>
                            <Button
                            onClick={() => {
                                navigate(`/Chapters/${currentChapter.currentChapterId}/EditChapter`, {
                                state: {
                                    chapterId: currentChapter.currentChapterId,
                                    chapterTitle: chapterState.selectedChapter.currentChapterTitle,
                                    chapterIcon: chapterState.selectedChapter.currentChapterIcon,
                                },
                                });
                            }}
                            variant="outlined"
                            sx={styles.button}
                            >
                            <EditIcon />
                            Edit chapter
                            </Button>
                            <Button component={Link} to="/CreateSubchapter" variant="outlined" sx={styles.button}>
                            <AddIcon />
                            Create subchapter
                            </Button>
                        </Stack>
                        )
                    ) : null}
                </React.Fragment>

            </Grid>
            {
                loading ? (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '200px',
                            margin: '0 auto',
                        }}
                    >
                        <CircularProgress color='info' size={40} thickness={4} />
                    </Box>
                ) :
                subchapterState.subchapterlist.length === 0 ? (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '200px',
                            margin: '0 auto',
                        }}
                    >
                        <Typography variant="h6" ml={""}>No subchapters found</Typography>
                    </Box>
                ) : (
                    <Grid container spacing={4}>
                        {!filtered.length ?
                            <Grid item sm={6}>
                                <Typography variant="h6" ml={""}>No subchapters found</Typography>
                            </Grid> :

                            filtered.map((subchapter) => {
                                return (
                                    <Grid item key={subchapter._id} xs={12} sm={6} md={4} lg={3}>
                                        <SubchapterCard
                                            subchapter={subchapter} chapterId={currentChapter.currentChapterId} />
                                    </Grid>
                                )

                            })
                        }
                    </Grid>
                )
            }
        </Box>
    )
}

export default Subchapters;