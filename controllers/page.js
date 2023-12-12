const { User, Post, Hashtag } = require('../models');

exports.renderProfile = (req, res, next) => {
  res.render('profile', { title: '내 정보 - NodeBird' });
};

exports.renderJoin = (req, res, next) => {
  res.render('join', { title: '회원가입 - NodeBird' });
};

exports.renderMain = async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      include: {
        model: User,
        attributes: ['id', 'nick'],
      },
      order: [['createdAt', 'DESC']],
    });
    res.render('main', {
      title: 'NodeBird',
      twits: posts,
      isMyPostsOnly: false, //1-2번 내글만 보기 전체 글 보기 토글 기능
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
}

exports.renderMainMyPosts = async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      where: { UserId: req.user.dataValues.id },
      include: {
      model: User,
      attributes: ["id", "nick"],
    },
    order: [["createdAt", "DESC"]],
    });
    console.log(posts);
    return res.render("main", {
      title: "NodeBird",
      twits: posts,
      isMyPostsOnly: true, // 동적으로 설정 //1-2번 내글만 보기 전체 글 보기 토글 기능
      });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.renderHashtag = async (req, res, next) => {
  const query = req.query.hashtag;
  if (!query) {
    return res.redirect('/');
  }
  try {
    const hashtag = await Hashtag.findOne({ where: { title: query } });
    let posts = [];
    if (hashtag) {
      posts = await hashtag.getPosts({ include: [{ model: User }] });
    }

    return res.render('main', {
      title: `${query} | NodeBird`,
      twits: posts,
      isMyPostsOnly: req.query.myposts === 'true', // 동적으로 설정 //1-2번 내글만 보기 전체 글 보기 토글 기능
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};