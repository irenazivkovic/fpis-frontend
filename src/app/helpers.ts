import { ResponseDto } from "./dto";
import { dataType } from "./types";
import axios from "axios";

const getData = async (url: string, type: dataType) => {
    const response = await axios.get(url);

    if (response.status === 200) {
        return response.data;
    } else {
        return type === "array" ? [] : {};
    }
};

const getAllData = async (url: string, type: dataType) => {
    const response = await axios.get(url);

    if (response.status === 200) {
        return response.data;
    } else {
        return type === "array" ? [] : {};
    }
};

const postData = async (url: string, data: any): Promise<ResponseDto> => {
    const response = await axios.post(url, data);

    return response.data;
};

const deleteData = async (url: string, id: any) => {
    const response = await axios.delete(url, id);

    return response.data;
};

const putData = async (url: string, data: any): Promise<ResponseDto> => {
    const response = await axios.put(url, data);

    return response.data;
};

const formatDate = (date: Date) => {
    date = new Date(date);

    let day: string = "";

    if (date.getDate() > 9) {
        day = date.getDate().toString();
    } else {
        day = `0${date.getDate().toString()}`;
    }

    let month: string = "";

    if (date.getMonth() + 1 > 10) {
        month = (date.getMonth() + 1).toString();
    } else {
        month = `0${(date.getMonth() + 1).toString()}`;
    }

    return `${date.getFullYear()}-${month}-${day}`;
};

export { getData, postData, getAllData, deleteData, putData, formatDate };
