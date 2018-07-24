const Page = require('./helpers/page');

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto('localhost:3000');
});

afterEach(async () => {
  await page.close();
});

describe('when logged in', async () => {
  beforeEach(async () => {
    await page.login();
    await page.click('a.btn-floating');
  });

  test('can see blog create form', async () => {
    const label = await page.getContentsOf('form label');

    expect(label).toBe('Blog Title');
  });

  describe('And using valid inputs', async () => {
    beforeEach(async () => {
      await page.type('.title input', 'My Blog Title');
      await page.type('.content input', 'My Blog Content');
      await page.click('form button');
    });

    test('Submitting take user to review screen', async () => {
      const text = await page.getContentsOf('h5');

      expect(text).toEqual('Please confirm your entries');
    });

    test('Submitting then saving adds blog to index page', async () => {
      await page.click('button.green');
      await page.waitFor('.card');

      const title = await page.getContentsOf('.card-title');
      const content = await page.getContentsOf('p');

      expect(title).toEqual('My Blog Title');
      expect(content).toEqual('My Blog Content');
    });
  });

  describe('And using invalid inputs', async () => {
    beforeEach(async () => {
      await page.click('form button');
    });
    test('form shows error msg', async () => {
      const titleError = await page.getContentsOf('.title .red-text');
      const contentError = await page.getContentsOf('.content .red-text');
      const stringError = 'You must provide a value';

      expect(titleError).toEqual(stringError);
      expect(contentError).toEqual(stringError);
    });
  });
});

describe('User is not logged in', async () => {
  const actions = [
    {
      method: 'get',
      path: '/api/blogs'
    },
    {
      method: 'post',
      path: '/api/blogs',
      data: {
        title: 'My Blog Title',
        content: 'My Blog Content'
      }
    }
  ];
  test('Blog related actions are prohibited', async () => {
    const results = await page.execRequests(actions);
    for (let result of results) {
      expect(result).toEqual({ error: 'You must log in!' });
    }
  });
});
