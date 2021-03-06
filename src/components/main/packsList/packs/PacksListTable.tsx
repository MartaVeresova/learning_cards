import React, {ChangeEvent, FC, memo, MouseEvent, useCallback, useEffect, useState} from 'react';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Button from '@material-ui/core/Button';
import TableHead from '@material-ui/core/TableHead';
import {deletePackTC, PacksInitialStateType, setCardPacksTC, updatePackTC} from '../../../../bll/packs-reducer';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStateType} from '../../../../bll/store';
import Table from '@material-ui/core/Table';
import {NavLink} from 'react-router-dom';
import {trimmedString} from '../../../../utils/trimmedString-util';
import {updateDate} from '../../../../utils/updateDate-util';
import TableBody from '@material-ui/core/TableBody';
import TablePagination from '@material-ui/core/TablePagination';
import {TablePaginationActions} from '../../commonComponents/TablePagination';
import TableFooter from '@material-ui/core/TableFooter';
import {LearnCardsModalAnswer} from '../../commonComponents/modal/learnCardsModal/LearnCardsModalAnswer';
import {OnePackType} from '../../../../dal/api';
import {
    CardsForLearnInitialStateType,
    fetchCardsOfPackTC,
    resetCardsOfPackAC,
    updatedGradeTC
} from '../../../../bll/learn-reducer';
import {EditPackModal} from '../../commonComponents/modal/editPackModal/EditPackModal';
import {LearnCardsModalQuestion} from '../../commonComponents/modal/learnCardsModal/LearnCardsModalQuestion';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import s from './PacksListTable.module.css'
import {createStyles, makeStyles} from '@material-ui/core/styles';
import {DeletePackModal} from '../../commonComponents/modal/deletePackModal/DeletePackModal';


const getCard = (cards: OnePackType[]) => {
    const sumOfRepeats = cards.reduce((acc, card) => (acc + (6 - card.grade) ** 2), 0)
    const random = Math.random() * sumOfRepeats
    let sum = 0
    let i = 0
    do {
        sum = sum + ((6 - cards[i].grade) ** 2)
        i++
    } while (sum < random)
    return cards[i - 1]
}


export const PacksListTable: FC<PacksListTableProps> = memo(props => {

    const classes = useStyles()
    const dispatch = useDispatch()
    const packs = useSelector<AppRootStateType, PacksInitialStateType>(state => state.packs)
    const id = useSelector<AppRootStateType, string>(state => state.profile._id)
    const cardsForLearn = useSelector<AppRootStateType, CardsForLearnInitialStateType>(state => state.cardsForLearn)

    const [deletePackModal, setDeletePackModal] = useState(false)
    const [deletePackData, setDeletePackData] = useState({id: '', name: ''})
    const [editPackModal, setEditPackModal] = useState(false)
    const [editPackData, setEditPackData] = useState({id: '', name: ''})
    const [learnCardsModalQuestion, setLearnCardsModalQuestion] = useState(false)
    const [learnCardsModalAnswer, setLearnCardsModalAnswer] = useState(false)

    const [randomCard, setRandomCard] = useState({} as OnePackType)
    const [name, setName] = useState('')
    const [cardsCount, setCardsCount] = useState(0)


    useEffect(() => {
        if (cardsForLearn.length) {
            setRandomCard(getCard(cardsForLearn))
            setLearnCardsModalAnswer(false)
            setLearnCardsModalQuestion(true)
        }
    }, [cardsForLearn])

    const fetchAnswerQuestion = useCallback(() => {
        setLearnCardsModalQuestion(false)
        setLearnCardsModalAnswer(true)
    }, [])

    const openNextRandomCard = useCallback((grade: number) => {
        dispatch(updatedGradeTC({grade, card_id: randomCard._id}, cardsCount))
    }, [dispatch, cardsCount, randomCard._id])

    const closeAllModal = useCallback(() => {
        dispatch(resetCardsOfPackAC())
        setLearnCardsModalQuestion(false)
        setLearnCardsModalAnswer(false)
    }, [dispatch])

    const closeEditPackModal = useCallback(() => {
        setEditPackModal(false)
    }, [])

    const handleChangePage = useCallback((e: MouseEvent<HTMLButtonElement> | null, newPage: number) => {
        dispatch(setCardPacksTC({page: newPage + 1}))
    }, [dispatch])

    const updatePackName = useCallback((newName?: string) => {
        dispatch(updatePackTC(editPackData.id, newName))
    }, [dispatch, editPackData.id])

    const closeDeletePackModal = useCallback(() => {
        setDeletePackModal(false)
    }, [])

    const onDeleteButtonClickHandler = useCallback(() => {
        dispatch(deletePackTC(deletePackData.id))
    }, [dispatch, deletePackData])

    const onClickSortHandler = (sortValue: SortByType) => {
        if (packs.sortPacksDirection === 0) {
            dispatch(setCardPacksTC({sortPacks: '1' + sortValue}))
        } else {
            dispatch(setCardPacksTC({sortPacks: '0' + sortValue}))
        }
    }

    const handleChangePageCount = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        dispatch(setCardPacksTC({pageCount: parseInt(e.target.value)}))
    }

    const startLearning = async (cardsPack_id: string, pageCount: number, name: string) => {
        await dispatch(fetchCardsOfPackTC({cardsPack_id, pageCount}))
        setName(name)
        setCardsCount(pageCount)
    }

    const openEditPackModal = (id: string, name: string) => {
        setEditPackData({id, name})
        setEditPackModal(true)
    }

    const openDeletePackModal = (id: string, name: string) => {
        setDeletePackData({id, name})
        setDeletePackModal(true)
    }


    return (
        <>
            {
                learnCardsModalQuestion &&
                <LearnCardsModalQuestion
                    packName={name}
                    question={randomCard.question}
                    onAnswerButtonClick={fetchAnswerQuestion}
                    closeAllModal={closeAllModal}
                />
            }
            {
                learnCardsModalAnswer &&
                <LearnCardsModalAnswer
                    packName={name}
                    question={randomCard.question}
                    answer={randomCard.answer}
                    openNextRandomCard={openNextRandomCard}
                    closeAllModal={closeAllModal}
                />
            }
            {
                editPackModal &&
                <EditPackModal
                    oldName={editPackData.name}
                    closeEditPackModal={closeEditPackModal}
                    updatePackName={updatePackName}
                />
            }
            {
                deletePackModal &&
                <DeletePackModal
                    packName={deletePackData.name}
                    closeDeletePackModal={closeDeletePackModal}
                    deletePack={onDeleteButtonClickHandler}
                />
            }
            <Table className={classes.table} aria-label="custom pagination table">
                <TableHead className={classes.tableHead}>
                    <TableRow>
                        <TableCell>
                            <TableSortLabel
                                active={packs.sortBy === 'name'}
                                direction={packs.sortPacksDirection === 1 ? 'desc' : 'asc'}
                                onClick={() => onClickSortHandler('name')}
                            >
                                Name
                            </TableSortLabel>
                        </TableCell>
                        <TableCell align="left">
                            <TableSortLabel
                                active={packs.sortBy === 'cardsCount'}
                                direction={packs.sortPacksDirection === 1 ? 'desc' : 'asc'}
                                onClick={() => onClickSortHandler('cardsCount')}
                            >
                                Cards
                            </TableSortLabel>
                        </TableCell>
                        <TableCell align="left">
                            <TableSortLabel
                                active={packs.sortBy === 'updated'}
                                direction={packs.sortPacksDirection === 1 ? 'desc' : 'asc'}
                                onClick={() => onClickSortHandler('updated')}
                            >
                                Last Updated
                            </TableSortLabel>
                        </TableCell>
                        <TableCell align="left">
                            <TableSortLabel
                                active={packs.sortBy === 'created'}
                                direction={packs.sortPacksDirection === 1 ? 'desc' : 'asc'}
                                onClick={() => onClickSortHandler('created')}
                            >
                                Created By
                            </TableSortLabel>
                        </TableCell>
                        <TableCell align="center">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        packs.cardPacks.map((cards) => (
                                <TableRow key={cards._id}>
                                    <TableCell component="th" title={cards.name}>
                                        <NavLink to={`/pack/${cards._id}`} className={classes.packsListTableBodyNavLink}>
                                            {trimmedString(cards.name, 10)}
                                        </NavLink>
                                    </TableCell>
                                    <TableCell align="left">{cards.cardsCount}</TableCell>
                                    <TableCell align="left">{updateDate(cards.updated)}</TableCell>
                                    <TableCell align="left" title={cards.user_name}>{trimmedString(cards.user_name, 10)}</TableCell>
                                    <TableCell align="right" style={{width: '224px'}}>
                                                    <span className={classes.packsListTableBodyActionsSection}>
                                                        {cards.user_id === id &&
                                                        <span>
                                                            <Button
                                                                onClick={() => openDeletePackModal(cards._id, cards.name)}
                                                                size="small"
                                                                variant="outlined"
                                                                color="secondary">Delete</Button>
                                                            <Button
                                                                onClick={() => openEditPackModal(cards._id, cards.name)}
                                                                size="small"
                                                                variant="outlined"
                                                                style={{margin: '0 10px'}}>Edit</Button>
                                                        </span>
                                                        }
                                                        <Button
                                                            onClick={() => startLearning(cards._id, cards.cardsCount, cards.name)}
                                                            size="small"
                                                            variant="outlined"
                                                            disabled={cards.cardsCount === 0}
                                                        >
                                                            Learn
                                                        </Button>
                                                    </span>
                                    </TableCell>
                                </TableRow>
                            )
                        )
                    }
                </TableBody>
                {
                    packs.cardPacksTotalCount > 5 &&
                    <TableFooter>
                        <TableRow>
                            <td className={s.footerPage}>
                                Page: {packs.page} (Total:{Math.ceil(packs.cardPacksTotalCount / packs.pageCount)})
                            </td>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25, {
                                    label: 'All',
                                    value: packs.cardPacksTotalCount
                                }]}
                                colSpan={6}
                                count={packs.cardPacksTotalCount}
                                rowsPerPage={packs.pageCount}
                                page={packs.page - 1}
                                SelectProps={{
                                    inputProps: {'aria-label': 'rows per page'},
                                    native: true,
                                }}
                                labelRowsPerPage={props.labelRowsPerPage}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangePageCount}
                                ActionsComponent={TablePaginationActions}
                            />
                        </TableRow>
                    </TableFooter>
                }
            </Table>
        </>
    )
})

type SortByType = 'name' | 'cardsCount' | 'updated' | 'created'
type PacksListTableProps = {
    labelRowsPerPage: string
}

const useStyles = makeStyles(() =>
    createStyles({
        table: {
            minWidth: '700px',
        },
        tableHead: {
            backgroundColor: 'lightblue',
        },
        packsListTableBodyNavLink: {
            textDecoration: 'none',
            color: 'black',
            '&:hover': {
                color: '#a5a5a5',
            },
        },
        packsListTableBodyActionsSection: {
            display: 'flex',
            width: '224px',
            justifyContent: 'flex-end',
        },
        footerPage: {
            display: 'flex',
            height: '53px',
            marginLeft: '10px',
            alignItems: 'center',
        },
    }),
);