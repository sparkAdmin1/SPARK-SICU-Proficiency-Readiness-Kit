const axios = require("axios")

const CHAPTER_ID = "6415b83df79d4564b394fbea"
const SUBCHAPTER_ID = "64193d8eeeb8e84870438c01"
//const API_URL = "https://spark-sicu-proficiency-readiness-kit-backend.vercel.app"
const API_URL = "http://localhost:8080"
const SUBCHAPTER_CONTENT = {
    "subchapterTitle": "Subchapter Id 2",
    "thumbnailPublicId": "",
    "thumbnail": "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    "description": "Subchapter 2 description",
    "content": "<h1> This is html content in subchapter 2 for chapter 2 </h1>" 
}

const SUBCHAPTER_EMPTY_CONTENT = {
    "subchapterTitle": "",
    "thumbnailPublicId": "",
    "thumbnail": "",
    "description": "",
    "content": "",
    "lastModifiedDateTime": "",
    "lastModifiedUserID": "",
    "lastModifiedUsername": "" 
}

const SUBCHAPTER_UPDATE_CONTENT = {
    "subchapterTitle": "Subchapter Id 2 Updated",
    "thumbnailPublicId": "",
    "thumbnail": "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    "description": "Subchapter 2 description",
    "content": "<h1> This is html content in subchapter 2 for chapter 2 </h1>",
    "lastModifiedUserID": "115424434485045779771",
    "selectedChapter": "6415b83df79d4564b394fbea"
}

const getAllSubchaptersForChapter = async (chapterId) => {
    const response = await axios.get(API_URL + `/chapters/${chapterId}/subchapters/`);
    return response.status;
}

const getSubchapterContent = async (chapterId, subchapterId) => {
    const response = await axios.get(API_URL + `/chapters/${chapterId}/subchapters/${subchapterId}`);
    return response.status;
}

const insertSubchapterContent = async (chapterId, content) => {
    const response = await axios.put(API_URL + `/chapters/${chapterId}/subchapters/`, content);
    return response;
}

const deleteSubchapterContent = async (chapterId, subchapterId) => {
    const response = await axios.delete(API_URL + `/chapters/${chapterId}/subchapters/${subchapterId}`);
    return response.status;
}

const updateSubchapterContent = async (chapterId, subchapterId, content) => {
    const response = await axios.put(API_URL + `/chapters/${chapterId}/subchapters/${subchapterId}`, content);
    return response;
}

describe("Testing getAllChapters route", () => {
    it("should return all subchapter of chapter with chapter ID", async () => {
        const status = await getAllSubchaptersForChapter(CHAPTER_ID);
        expect(status).toEqual(200)
    })
})

describe("Testing getSubchapterContent route", () => {
    it("should return subchapter content", async () => {
        const status = await getSubchapterContent(CHAPTER_ID, SUBCHAPTER_ID);
        expect(status).toEqual(200)
    })
})

describe("Testing add empty subchapter content route", () => {
    it("should return a 404 error status", async () => {

        try{
            const res = await insertSubchapterContent(CHAPTER_ID, SUBCHAPTER_EMPTY_CONTENT);
        } catch(error) {
            console.log("error: ", error.response.data);
            expect(error.response.status).toEqual(404);
        }
    })
})


describe("Testing create new subchapter, edit, and delete subchapter content route", () => {

    let newSubchapterId = ""
    // Increase the timeout for this test case to 30 seconds
    jest.setTimeout(30000)

    it("should return a status of 200 indicating that record has been successfully inserted", async () => {
        const res = await insertSubchapterContent(CHAPTER_ID, SUBCHAPTER_CONTENT);
        expect(res.status).toEqual(200)
        newSubchapterId = res.data
    })

    it("should return a status of 200 indicating that record has been successfully edited", async () => {
        const res = await updateSubchapterContent(CHAPTER_ID, newSubchapterId, SUBCHAPTER_UPDATE_CONTENT);
        expect(res.status).toEqual(200)
        newSubchapterId = res.data
    })

    it("should remove a subchapter content", async () => {
        const status = await deleteSubchapterContent(CHAPTER_ID, newSubchapterId);
        expect(status).toEqual(200)
    })
})