import Vue from "vue/dist/vue.esm";
import marked from "marked";
import Airtable from "airtable";
import moment from "moment";

var base = new Airtable({ apiKey: "keyszUVP1GF2MGoyr" }).base("appjILMtUDDvPUMzS");

Vue.component("news-post", {
  props: ["postTitle", "postDate", "postContent", "postAuthor"],
  data: function () {
    return {
      marked: marked,
    };
  },
  template: `
  <article class="news-item">
    <h2>{{postTitle}}</h2>
    <h4 class="c_blue">{{postDate}}</h4>
    <div v-html="marked(postContent)"></div>
    <h3>{{postAuthor}}</h3>
  </article>
  `,
});

Vue.component("news-posts", {
  props: ["postlimit"],
  data: function () {
    return {
      posts: [],
    };
  },
  template: `
    <section class="news-posts">
      <template v-for="post in posts" :key="post.Title">
        <news-post :postTitle="post.Title" :postContent="post.Content" :postAuthor="post.Author" :postDate="post.Date" >
      </template>
    </section>
    `,
  mounted() {
    const limit = this.postlimit ? parseInt(this.postlimit) : 1000;
    base("News Posts")
      .select({
        maxRecords: limit,
        view: "Grid view",
        sort: [{ field: "Date", direction: "desc" }],
      })
      .eachPage(
        (records, fetchNextPage) => {
          records.forEach((record) => {
            this.posts.push({
              Title: record.get("Title"),
              Content: record.get("Content"),
              Date: moment(record.get("Date")).format("dddd, MMMM Do YYYY, h:mm a"),
              Author: record.get("Author"),
            });
          });

          fetchNextPage();
        },
        function done(err) {
          if (err) {
            console.error(err);
            return;
          }
        }
      );
  },
});

var app = new Vue({
  el: "#app",
});
