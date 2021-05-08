import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CommentIcon from '@material-ui/icons/Comment';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { CircularProgress, Grid } from '@material-ui/core';
import ReactHtmlParser from 'react-html-parser';
var _ = require('lodash');

const topStoriesUrl = 'https://hacker-news.firebaseio.com/v0/topstories.json';

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 1300,
    margin: 'auto',
    marginBottom: 10,
    // backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },

  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  commentsSection: {
    border: '1px solid #ddd',
    borderRadius: 4,
    margin: 2,
    padding: 5,
  },
}));

export default function HackerNews() {
  const classes = useStyles();
  const [top10Stories, setTop10Stories] = useState([]);
  const [top20Comments, setTop20Comments] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loader, setLoader] = useState(false);

  const handleExpandClick = (id, kids) => {
    if (expanded !== id) {
      setExpanded(id);
      fetchComments(id, kids);
    } else {
      setExpanded(null);
    }
  };

  useEffect(() => {
    const invokeApi = async () => {
      setLoader(true);
      const { data: topStories } = await axios.get(topStoriesUrl);

      const promises = topStories
        .slice(0, 10)
        .map((id) =>
          axios
            .get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
            .then(({ data }) => data)
        );

      const top10Stories = await Promise.all(promises);
      setLoader(false);
      setTop10Stories(top10Stories);
    };

    invokeApi();
  }, []);

  const fetchComments = async (id, kids) => {
    if (kids && kids.length) {
      setLoader(true);
      const promises = kids
        .slice(0, 20)
        .map((id) =>
          axios
            .get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
            .then(({ data }) => data)
        );

      const comments = await Promise.all(promises);

      setLoader(false);

      let tempData = _.cloneDeep(top20Comments);
      let indexValue = top20Comments.findIndex((i) => i.id === id);
      let top20CommentsTempData;

      if (indexValue > -1) {
        top20CommentsTempData = tempData.splice(indexValue, 1, {
          id,
          comments,
        });
      } else {
        top20CommentsTempData = [...top20Comments, { id, comments }];
      }

      setTop20Comments(top20CommentsTempData);
    }
  };

  const getComments = ({ comments = [] }) =>
    comments.map(({ text }) => (
      <Grid item xs={12} className={classes.commentsSection}>
        {ReactHtmlParser(text)}
      </Grid>
    ));

  return (
    <React.Fragment>
      <header className='text-center'>
        <Typography variant='h3' gutterBottom>
          Hacker News Coding Test
        </Typography>
      </header>
      {top10Stories.map(({ id, title, kids, time }) => {
        return (
          <Card className={classes.root} key={id}>
            <CardHeader
              title={title}
              subheader={new Date(time * 1000).toLocaleDateString('en-IN', {
                hour: 'numeric',
                minute: 'numeric',
              })}
            />
            <CardActions disableSpacing>
              <IconButton aria-label='comment'>
                <CommentIcon />
              </IconButton>
              <span>{(kids && kids.length) || 0}</span>
              <IconButton
                className={clsx(classes.expand, {
                  [classes.expandOpen]: expanded === id,
                })}
                onClick={() => handleExpandClick(id, kids)}
                aria-expanded={expanded === id}
                aria-label='show more'
              >
                <ExpandMoreIcon />
              </IconButton>
            </CardActions>
            <Collapse in={expanded === id} timeout='auto' unmountOnExit>
              <CardContent>
                <Typography paragraph>Top 20Comments:</Typography>
                <Grid container spacing={3}>
                  {top20Comments
                    .filter((item) => item.id === id)
                    .map(getComments)}
                </Grid>
              </CardContent>
            </Collapse>
          </Card>
        );
      })}

      {loader && (
        <div className='custom-loader'>
          <CircularProgress size={60} />
        </div>
      )}
    </React.Fragment>
  );
}
