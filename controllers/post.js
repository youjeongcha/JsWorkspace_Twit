const { Post, Hashtag } = require('../models');
const {renderMain} = require('./page');

exports.afterUploadImage = (req, res) => {
  console.log(req.file);
  res.json({ url: `/img/${req.file.filename}` });
};

exports.uploadPost = async (req, res, next) => {
  try {
    const post = await Post.create({
      content: req.body.content,
      img: req.body.url,
      UserId: req.user.id,
    });
    const hashtags = req.body.content.match(/#[^\s#]*/g);
    if (hashtags) {
      const result = await Promise.all(
        hashtags.map(tag => {
          return Hashtag.findOrCreate({
            where: { title: tag.slice(1).toLowerCase() },
          })
        }),
      );
      await post.addHashtags(result.map(r => r[0]));
    }
    res.redirect('/');
  } catch (error) {
    console.error(error);
    next(error);
  }
};



//-------게시글 수정 삭제-----------

// 게시글 수정
exports.editPost = async (req, res, next) => {
  try {
    const { twitId, newContent } = req.body;
    console.log('게시글 수정 요청 받음:');

    // 여기에서 게시글 수정 로직 수행 (예: 데이터베이스 업데이트 등)
    const updatedPost = await Post.update({ content: newContent }, { where: { id: twitId } });

    if (updatedPost[0] === 1) {
      res.json({ success: true, message: '게시글이 성공적으로 수정되었습니다.' });
    } else {
      res.json({ success: false, message: '게시글 수정에 실패했습니다.' });
    }
  } catch (error) {
    console.error('에러:', error);
    res.status(500).json({ error: '내부 서버 오류' });
  }
};

// 게시글 삭제
exports.deletePost = async (req, res, next) => {
  try {
    const { twitId } = req.body;
    console.log('게시글 삭제 요청 받음:', twitId);
    // 여기에서 게시글 삭제 로직 수행 (예: 데이터베이스에서 삭제 등)
    const deletedPost = await Post.destroy({ where: { id: twitId } });

    if (deletedPost != null) {
      renderMain(req, res, next);
      res.json({ success: true, message: '게시글이 성공적으로 삭제되었습니다.' });
    } else {
      res.json({ success: false, message: '게시글 삭제에 실패했습니다.' });
    }
  } catch (error) {
    console.error('에러:', error);
    res.status(500).json({ error: '내부 서버 오류' });
  }
};