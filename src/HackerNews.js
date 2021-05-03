import React, { useEffect, useState } from 'react';
import axios from 'axios';

const topStoriesUrl = 'https://hacker-news.firebaseio.com/v0/topstories.json';

export default function HackerNews() {
  const [top10Stories, setTop10Stories] = useState([]);
  const [top20Comments, setTop20Comments] = useState([]);

  useEffect(() => {
    const invokeApi = async () => {
      const { data: topStories } = await axios.get(topStoriesUrl);

      const promises = topStories
        .slice(0, 10)
        .map((id) =>
          axios
            .get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
            .then(({ data }) => data)
        );

      const top10Stories = await Promise.all(promises);

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
      {top10Stories.map(({ id, title, kids }) => {
        return (
          <div key={id}>
            <div>
              <span>{title}</span>
            </div>
            <div>
              <span onClick={() => fetchComments(id, kids)}>{`${
                (kids && kids.length) || 0
              } comments`}</span>
            </div>
            <br />
          </div>
        );
      })}
    </React.Fragment>
  );
}
