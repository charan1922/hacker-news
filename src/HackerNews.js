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
import { CircularProgress } from '@material-ui/core';

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
}));

export default function HackerNews() {
  const classes = useStyles();
  const [top10Stories, setTop10Stories] = useState([]);
  const [top20Comments, setTop20Comments] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [loader, setLoader] = useState(false);

  const handleExpandClick = (id, kids) => {
    setExpanded(!expanded);
    fetchComments(id, kids);
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
      const promises = kids
        .slice(0, 20)
        .map((id) =>
          axios
            .get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
            .then(({ data }) => data)
        );

      const comments = await Promise.all(promises);
      setTop20Comments([...top20Comments, { id, comments }]);
    }
  };

  //   console.log(top10Stories, ':top10Stories');
  //   console.log(top20Comments, ':top20Comments');
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
                  [classes.expandOpen]: expanded,
                })}
                onClick={() => handleExpandClick(id, kids)}
                aria-expanded={expanded}
                aria-label='show more'
              >
                <ExpandMoreIcon />
              </IconButton>
            </CardActions>
            <Collapse in={expanded} timeout='auto' unmountOnExit>
              <CardContent>
                <Typography paragraph>Comments:</Typography>
                {top20Comments
                  .filter((item) => item.id === id)
                  .map(getComments)}
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

const getComments = ({ comments = [] }) =>
  comments.map(({ text }) => (
    <>
      <Typography paragraph>{text}</Typography>
    </>
  ));
