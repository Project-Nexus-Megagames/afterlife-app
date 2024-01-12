import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { filteredActions, getAgendaActions, setFilter } from '../../redux/entities/playerActions';
import NewAction from './Modals/NewAction';
import Action from "./ActionList/Action/Action";
import { Grid, GridItem, Flex, Input, InputGroup, InputLeftElement, Tooltip, IconButton, Accordion } from "@chakra-ui/react";
import usePermissions from "../../hooks/usePermissions";
import { AddIcon, SearchIcon } from "@chakra-ui/icons";
import { useNavigate } from 'react-router';
import ActionList from './ActionList/ActionList';
import NewAgenda from './Agendas/NewAgenda';

const Agendas = (props) => {
	const actions = useSelector(s => s.actions.list);
	const agendas = useSelector(getAgendaActions);
	const fActions = useSelector(filteredActions);
	const filter = useSelector(s => s.actions.filter);
	const login = useSelector(s => s.auth.login);
	const gamestate = useSelector(s => s.gamestate);
	const gameConfig = useSelector(s => s.gameConfig);


	const navigate = useNavigate();
  const [showNewActionModal, setShowNewActionModal] = useState(false);
  const [assetInfo, setAssetInfo] = useState({show: false, asset: ''});
  const [editAction, setEditAction] = useState({show: false, action: null})
  const {isControl} = usePermissions();
  const [rounds, setRounds] = useState([]);
  const [renderRounds, setRenderRounds] = useState([]);
  const [selected, setSelected] = useState(false);

    useEffect(() => {
      console.log('aaaa')
        try {
           if (selected) {
            console.log('weee')
            setSelected(agendas.find(el => el._id === selected._id));
           } 
        } catch (err) {
            console.log(err);
        }
    }, [agendas])

    const createListCategories = (actions) => {
        const rounds = [];
        for (const action of actions) {
            if (!rounds.some((item) => item === action.round)) {
                rounds.push(action.round);
            }
        }
        rounds.reverse();
        setRounds(rounds);
        setRenderRounds(rounds.slice(0, 1))
    };

    const handleRoundToggle = (round) => {
      if (renderRounds.some(r => r === round)) setRenderRounds(renderRounds.filter((r => r !== round)))
      else setRenderRounds([ ...renderRounds, round ])
    }

    const sortedActions = (currRound, actions) => {
        return actions
            .filter((action) => action.round === currRound)
            .sort((a, b) => {
                // sort alphabetically
                if (a.creator.characterName < b.creator.characterName) {
                    return -1;
                }
                if (a.creator.characterName > b.creator.characterName) {
                    return 1;
                }
                return 0;
            })            
    }

    const actionList = agendas;
    return (
			<Grid
          templateAreas={`"nav main"`}
          gridTemplateColumns={ '20% 80%'}
          gap='1'
          fontWeight='bold'>

        <GridItem pl='2' bg='#0f131a' area={'nav'} >
          <Flex align={'center'}>
            <InputGroup>
                <InputLeftElement
                    pointerEvents='none'
                >
                    <SearchIcon/>
                </InputLeftElement>
                <Input
                    onChange={(e) => setFilter(e.target.value)}
                    value={filter}
                    placeholder="Search"
                    color='white'
                />
            </InputGroup>
            <Tooltip
                label='Add New Action'
                aria-label='a tooltip'>
                <IconButton
                    icon={<AddIcon/>}
                    variant="solid"
                    onClick={setShowNewActionModal}
                    colorScheme={'green'}
                    style={{
                        marginLeft: '1rem'
                    }}
                    aria-label='Add New Action'
                />
            </Tooltip>
          </Flex>
          <ActionList actions={actionList} handleSelect={setSelected} />
				</GridItem>

        <GridItem overflow='auto' pl='2' bg='#0f131a' area={'main'} style={{ height: 'calc(100vh - 120px)', overflow: 'auto', }} >
          {showNewActionModal && <NewAgenda closeNew={() => setShowNewActionModal(false)} actionType={gameConfig.actionTypes[1]} />}
          {selected && !showNewActionModal &&
            <Accordion
              allowMultiple                    
              width={'100%'}
              defaultIndex={[0]}
            >
              <Action
                action={selected}
                actionType={gameConfig.actionTypes[1]}
                key={selected._id}
                toggleAssetInfo={(asset) => {
                    setAssetInfo({show: true, asset});
                }}
              />              
            </Accordion>
          }
        </GridItem>

      </Grid>
    );
};

export default (Agendas);