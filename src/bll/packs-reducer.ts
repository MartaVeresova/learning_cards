import {AppRootStateType, AppThunk} from './store';
import {setAppErrorAC, setAppStatusAC} from './app-reducer';
import {cardPacksApi, CreatePackRequestType, PacksRequestDataType, PacksResponseType, PacksType} from '../dal/api';
import {packsApiModel} from '../utils/cardsApiModel-util';


const initialState = {
    cardPacks: [] as Array<PacksType>,
    myPacks: false,
    page: 1,
    pageCount: 5,
    min: 0,
    max: 110,
    minCardsCount: 0,
    maxCardsCount: 110,
    sortPacksDirection: 0,
    sortBy: 'updated',
    user_id: '',
    packName: '',
    searchText: '',
    cardPacksTotalCount: 1,
} as PacksInitialStateType


export const packsReducer = (state = initialState, action: PacksActionsType): PacksInitialStateType => {
    switch (action.type) {

        case 'packs/SET-CARD-PACKS':
            return {
                ...state,
                ...action.data,
                myPacks: action.data.user_id.length > 1,
                sortBy: action.data.sortPacks.slice(1),
                sortPacksDirection: Number(action.data.sortPacks.substring(0, 1)),
                searchText: action.data.packName,
            }

        default:
            return state;
    }
}

//actions
export const setCardPacksAC = (data: PacksResponseType & NewCardsApiModelType) =>
    ({type: 'packs/SET-CARD-PACKS', data} as const)


//thunks
export const setCardPacksTC = (data?: PacksRequestDataType): AppThunk =>
    async (dispatch, getState: () => AppRootStateType) => {
        dispatch(setAppStatusAC('loading'))
        const newCardsApiModel = packsApiModel(getState().packs, data)

        const pastPageCount = getState().packs.pageCount
        const currentPage = getState().packs.page
        const currentPageCount = newCardsApiModel.pageCount
        const newPage = pastPageCount !== currentPageCount
            ? Math.floor(pastPageCount * (currentPage - 1) / currentPageCount) + 1
            : newCardsApiModel.page

        try {
            const res = await cardPacksApi.fetchPacks({...newCardsApiModel, page: newPage})
            dispatch(setCardPacksAC({...res.data, ...newCardsApiModel, page: newPage}))
        } catch (err) {
            dispatch(setAppErrorAC(err.response ? err.response.data.error : err.message))
        } finally {
            dispatch(setAppStatusAC('succeeded'))
        }
    }

export const createPackTC = (data: CreatePackRequestType): AppThunk => async dispatch => {
    dispatch(setAppStatusAC('loading'))
    try {
        await cardPacksApi.createPack(data)
        dispatch(setCardPacksTC({packName: '', page: 1, sortPacks: '0updated'}))
    } catch (err) {
        dispatch(setAppErrorAC(err.response ? err.response.data.error : err.message))
    }
}

export const deletePackTC = (packId: string): AppThunk =>
    async (dispatch, getState: () => AppRootStateType) => {
        dispatch(setAppStatusAC('loading'))
        try {
            await cardPacksApi.deletePack(packId)
            const cardsState = getState().packs
            const remainPacks = cardsState.cardPacksTotalCount - (cardsState.pageCount * (cardsState.page - 1))
            dispatch(setCardPacksTC({
                page: remainPacks === 1
                    ? cardsState.page === 1 ? cardsState.page : cardsState.page - 1
                    : cardsState.page
            }))
        } catch (err) {
            dispatch(setAppErrorAC(err.response ? err.response.data.error : err.message))
        }
    }

export const updatePackTC = (packID: string, name?: string): AppThunk =>
    async dispatch => {
        dispatch(setAppStatusAC('loading'))
        try {
            await cardPacksApi.updatePack({_id: packID, name})
            dispatch(setCardPacksTC({page: 1}))
        } catch (err) {
            dispatch(setAppErrorAC(err.response ? err.response.data.error : err.message))
        }
    }

//types
export type PacksInitialStateType = PacksResponseType & {
    myPacks: boolean
    sortPacksDirection: number
    sortBy: string
    user_id: string
    packName: string
    searchText: string
    min: number
    max: number
    cardPacksTotalCount: number
}
type NewCardsApiModelType = {
    packName: string
    min: number
    max: number
    sortPacks: string
    page: number
    pageCount: number
    user_id: string
}

export type SetCardPacksActionType = ReturnType<typeof setCardPacksAC>

export type PacksActionsType =
    | SetCardPacksActionType
