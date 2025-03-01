import React from 'react'
import { Button, Stack } from '@mui/material'
import FilterListIcon from '@mui/icons-material/FilterList'
import AddIcon from '@mui/icons-material/Add'
import ChapterCard from '../components/chapters/ChapterCard'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import axios from 'axios'
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { useState, useEffect } from 'react'
import { useAppState, useActions } from '../overmind'
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {  trim} from 'lodash';


const Chapters = ({searchInput}) => {
    let filtered =[];

    const chapterState = useAppState().chapters
    const chapterActions = useActions().chapters
    const userState = useAppState().user
    const userType = userState.currentUser.userType

    useEffect(() => {
        if (!chapterState.chapterlist || chapterState.chapterlist.length === 0) {
            chapterActions.loadChapters();

        }
        
    }, [])


    const searchChapters = (searchInput, chapter) => {
        // console.log(searchInput)
        if (searchInput == "" || searchInput==null) {
            return chapter
        } else{

            let rgx = "?![^<>]*>";
            const regex = new RegExp(`(${trim(searchInput)})(${rgx})`, 'gi');
            for(var subchapters of chapter.subchapters){

                if (
                    chapter.title.toLowerCase().includes(searchInput.toLowerCase()) ||
                    
                    subchapters.subchapterTitle.toLowerCase().includes(searchInput.toLowerCase()) || 
                    regex.test(subchapters.content) ){
                    return chapter
                }
            }

  
    }};
    filtered = chapterState.chapterlist.filter((chapter) => searchChapters(searchInput,chapter))

    //button's styling
    const styles = {
        button: {
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

    return (
        <Box margin={4}>
            <Grid pb={2} display="flex" alignItems="center" mb={1}>
                <Typography pr={2} style={{fontSize: '25px', fontWeight: 'bold'}}>Chapters</Typography>
                

                <React.Fragment>
                    {
                        userType !="junior"? 
                        
                <Stack direction="row" spacing={2} ml="auto">

                    <Button 
                        component={Link}
                        to="/CreateChapter"
                        variant="outlined"
                        sx={styles.button}
                        >
                        <AddIcon />
                            Create chapter
                    </Button>
                </Stack>
                        :null
                    }
                </React.Fragment>
            
            </Grid>
            {
                !chapterState.chapterlist || chapterState.chapterlist.length === 0 ? ( 
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
                    ) : (
                        <Grid container spacing={3}>
                    { !filtered.length ? 
                            <Grid item sm={6}>
                                <Typography variant="h6" ml={""}>No chapters found</Typography>
                            </Grid> :
                                filtered.map((chapter) => {
                                    return (
                                        <Grid key={chapter._id} item>
                                            <ChapterCard chapter={chapter} />
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

export default Chapters