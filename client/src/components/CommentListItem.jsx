import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Emoji } from 'emoji-mart';
import axios from 'axios';
import CommentReplyList from './CommentReplyList.jsx';
import { getUserProfileById } from '../services/services';
import Emojis from './Emojis.jsx';

// sub component of commentListItem where we recieve a comment
const CommentListItem = ({ comment, key, comments, currentUser }) => {
  // destructure the username and comment out of props
  const { username, commentText, createdAt, id_user, id, emojiData, replyData } = comment;

  // a user set state for the profile image
  const [user, setUser] = useState({ imageUrl: '' });
  const [seen, setSeen] = useState(false);
  const [reply, setReply] = useState(false);
  const [emojiArray, setEmojiArray] = useState(JSON.parse(emojiData));
  // example comment data
  const [replyArray, setReplyArray] = useState(JSON.parse(replyData));


 // add the replied comment to the reply data
  const addCommentToReplyData = (text) => {
    console.log(text, 'in CommentListItem');
    // copy the current replyData
    const newArr = [...replyArray];
    // construct the new comment
    const newComment = {
      id: newArr.length,
      commentText: text,
      username: currentUser.username,
      emojiData: [],
      createdAt: moment(),
      id_user: currentUser.id,
    };
    // add the new comment to the newArr
    newArr.push(newComment);
    // replace the replyData
    setReplyArray(newArr);
    // I need to update it in the storage yeah!
  };

  const updateEmojiDataOnReplyComment = (emojiArr, id) => {
      // copy the current replyData
      const newArr = [...replyArray];
      // modify the emojiData on the selected comment
      newArr[id].emojiData = emojiArr;
      // replace replyData with the modified newArr
      setReplyArray(newArr);
  }


  useEffect(() => {
    getUserProfileById(id_user)
      .then(res => {
        console.log(res);
        setUser(res.data);
      })
      .catch(err => console.error(err));
  }, []);

  // make a function that will save the current state of the comment into the database
  const updateComment = () => {
    // stingify the emojiArray
    const emojiString = JSON.stringify(emojiArray);
    axios.post('/comment/update', { emojiString, id });
  };




  const toggleEmoji = () => {
    setSeen(!seen);
    console.log('hello');
  };

  const toggleReply = () => {
    setReply(!reply);
  };

  const addToEmojiArray = (emojiObject) => {
    console.log(emojiObject);
    // make a new array with the added emoji
    const newArr = [...emojiArray];
    newArr.push({ id: emojiObject.id, skin: emojiObject.skin, count: 1 });
    console.log(newArr);
    setEmojiArray(newArr);
    updateComment();
  };

  const addToEmojiCount = (index) => {
    // copy the current array of objects
    const newArr = [...emojiArray];
    // update the count
    newArr[index].count += 1;
    setEmojiArray(newArr);
    updateComment();
  };

  return (
    <div className="flex items-start px-4 py-6 bg-white shadow-lg">
      <img className="w-12 h-12 rounded-full object-cover mr-4 shadow" src={user.imageUrl} alt="avatar" />
      <div className="">
        <div className="flex items-center" id={key}>
          <h2 className="text-lg font-semibold text-gray-900 -mt-1">{username}</h2>
          <small className="text-sm text-gray-700 object-left">&nbsp;&nbsp;&nbsp;{moment(createdAt).fromNow()}</small>
        </div>
        <p className="mt-3 text-gray-700 text-sm">
          {commentText}
        </p>
        <div className="mt-4 flex items-center">
          {emojiArray.map((emoji, index) => (
            <div className="flex mr-2 text-gray-700 text-sm mr-3">
              <button className="modal-open bg-transparent hover:border-indigo-500 text-gray-500 hover:text-indigo-500 font-bold py-1 px-2 rounded-none" style={{ outline: 'none' }} onClick={() => addToEmojiCount(index)}>
                <Emoji emoji={{ id: emoji.id, skin: emoji.skin }} size={32} />
              </button>
              <div className="flex items-center justify-between" id={key}>
                <p>{emoji.count}</p>
              </div>
            </div>
          ))}
          <div className="flex mr-2 text-gray-700 text-sm mr-4">
            <button className="modal-open bg-transparent border border-gray-500 hover:border-indigo-500 text-gray-500 hover:text-indigo-500 font-bold py-1 px-2 rounded-full" style={{ outline: 'none' }} onClick={toggleEmoji}>+</button>
            {seen ? <Emojis toggleEmoji={toggleEmoji} addToEmojiArray={addToEmojiArray} /> : null}
            <button className="modal-open bg-transparent border border-gray-500 hover:border-indigo-500 text-gray-500 hover:text-indigo-500 font-bold py-1 px-2 rounded-full" style={{ outline: 'none' }} onClick={toggleReply}>+</button>
            {reply ? <CommentReplyList comments={replyArray} toggleReply={toggleReply} addComment={addCommentToReplyData} updateEmojiData={updateEmojiDataOnReplyComment} /> : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentListItem;


// [{
//   id: 1,
//   commentText: 'This is the first example text I am trying to use for the reply to comments',
//   username: 'moMoney',
//   emojiData: '[]',
//   createdAt: '2020-06-28T15:29:08.000Z',
//   id_user: 1,
// },
// {
//   id: 2,
//   commentText: 'This is the second example text I am trying to use for the reply to comments yahhhhhhh',
//   username: 'moMoney',
//   emojiData: '[]',
//   createdAt: '2020-06-28T15:29:08.000Z',
//   id_user: 1,
// },
// {
//   id: 3,
//   commentText: 'This is the third example text I am trying to use for the reply to comments woooooohooooooo',
//   username: 'moMoney',
//   emojiData: '[]',
//   createdAt: '2020-06-28T15:29:08.000Z',
//   id_user: 1,
// },
// ]);