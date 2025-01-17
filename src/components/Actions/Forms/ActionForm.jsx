import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getFadedColor, getTextColor } from '../../../scripts/frontend';
import { getMyAssets } from '../../../redux/entities/assets';
import { Tag, Box, Flex, Button, Divider, Spacer, Center, useBreakpointValue, Icon, VStack, Text } from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import AssetCard from '../../Common/AssetCard';
import { AddAsset } from '../../Common/AddAsset';
import SelectPicker from '../../Common/SelectPicker';
import { getCharAccount } from '../../../redux/entities/accounts';
import ResourceNugget from '../../Common/ResourceNugget';
import { HiSave } from 'react-icons/hi';

/**
 * Form for a new ACTION
 * @param { , collabMode, handleSubmit, defaultValue, actionID, closeNew } props
 * @returns Component
 */
const ActionForm = (props) => {
  const { collabMode, handleSubmit, defaultValue, actionID, closeNew, header, loading } = props;

  const { gameConfig } = useSelector((state) => state);
  const { myCharacter } = useSelector((s) => s.auth);
  // const myCharacter = useSelector(getMyCharacter);
  const myAssets = useSelector(getMyAssets);
  const myContacts = useSelector(s => s.characters.list);
  const locations = useSelector((state) => state.locations.list)
  const facilities = useSelector((state) => state.facilities.list)
  const myAccout = useSelector(getCharAccount);

  const [effort, setEffort] = React.useState(defaultValue?.effort ? { effortType: defaultValue.effort.effortType, amount: defaultValue.effort.amount } : { effortType: 'Normal', amount: 0 });
  const [resources, setResources] = React.useState(defaultValue?.resouces ? defaultValue.resouces : []);
  const [assets, setAssets] = React.useState(defaultValue?.assets ? defaultValue.assets : []);
  const [collaborators, setCollaborators] = React.useState(defaultValue?.collaborators ? defaultValue.collaborators : []);
  const [actionType, setActionType] = React.useState(
    props.actionType ? gameConfig.actionTypes.find(el => el.type === props.actionType) :
      gameConfig.actionTypes[0]);
  const [description, setDescription] = React.useState(defaultValue?.description ? defaultValue.description : '');

  const [intent, setIntent] = React.useState(defaultValue?.intent ? defaultValue.intent : '');
  const [name, setName] = React.useState(defaultValue?.name ? defaultValue.name : '');
  const [destination, setDestination] = React.useState(defaultValue?.location ? defaultValue.location : false);
  const [facility, setFacility] = React.useState(undefined);


  useEffect(() => {
    if (actionType && actionType.type && !defaultValue) {
      // setEffort({ effortType: actionType.effortTypes[0], amount: 0 });
      newMap(actionType.maxAssets);
    }
  }, [actionType?.type]);

  useEffect(() => {
    newMap(actionType?.maxAssets);
  }, [actionType])

  const editState = (incoming, type, index) => {
    // console.log(incoming, type, index)
    let thing;
    switch (type) {
      case 'Asset':
        let temp = [...assets];
        temp[index] = incoming;
        setAssets(temp);
        break;
      case 'collab':
        setCollaborators(collaborators.filter(c => c._id !== incoming._id));
        break;
      default:
        console.log(`uWu Scott made an oopsie doodle! ${type} `);
    }
  };

  const passSubmit = async () => {
    // 1) make a new action
    const data = {
      assets: assets.filter(el => el),
      description: description,
      intent: intent,
      name: name,
      type: actionType.type,
      location: destination,
      myCharacter: myCharacter._id,
      creator: myCharacter._id,
      id: actionID
    };
    closeNew();
    handleSubmit(data)

    // setActionType(false);
    // setDescription('');
    // setIntent('');
    // setName('');
    // setResources([]);
    // setCollaborators([]);

  };


  function newMap(number) {
    let arr = [];
    for (let i = 0; i < number; i++) {
      arr.push(defaultValue?.assets[i]);
    }
    setAssets(arr);
  }

  const maxLength = 4000;
  const disabledConditions = [
    {
      text: "Description is too short",
      disabled: description.length < 10
    },
    {
      text: "Description is too long!",
      disabled: description.length >= maxLength
    },
    {
      text: "Name is too short",
      disabled: name.length < 10 && !collabMode
    },
    {
      text: "Name is too long!",
      disabled: name.length >= 1000 && !collabMode
    },
    {
      text: "Location required",
      disabled: !destination && !collabMode && actionType.requiresDestination
    },
    // {
    //   text: "Not Enough Resources for this action",
    //   disabled: isResourceDisabled()
    // },
  ];
  const isDisabled = disabledConditions.some(el => el.disabled);


  return (
    <div>
      {header && <h4>{header}</h4>}
      {!header && <h4>Edit {actionType.type} Action</h4>}
      <br />
      <form>

        <Flex width={"100%"} align={"end"} >
          {actionType.collab && !collabMode && <Box>
            Collaborators:
          </Box>}
          <Spacer />
          {!collabMode && <Box width={"49%"}>
            Name:
            {10 - name.length > 0 && (
              <Tag variant='solid' style={{ color: 'black' }} colorScheme={'orange'}>
                {10 - name.length} more characters...
              </Tag>
            )}
            {10 - name.length <= 0 && (
              <Tag variant='solid' colorScheme={'green'}>
                <CheckIcon />
              </Tag>
            )}
            <textarea rows='1' value={name} className='textStyle' onChange={(event) => setName(event.target.value)}></textarea>
          </Box>}

          <Spacer />

          {!collabMode && actionType.requiresDestination && <Box width={"49%"}>
            Destination
            {!destination && actionType.requiresDestination && (
              <Tag variant='solid' style={{ color: 'black' }} colorScheme={'orange'}>
                Select Destination
              </Tag>
            )}

            {destination && (
              <Tag variant='solid' colorScheme={'green'}>
                <CheckIcon />
              </Tag>
            )}
            <h5>{locations.find(el => el._id === destination)?.name}</h5>
            <Flex>
              <SelectPicker
                data={locations}
                label="name"
                onChange={setDestination}
                placeholder={destination ? locations.find(el => el._id === destination)?.name : "Select a Destination (" + locations.length + ") in range"}
                value={destination}
              />

              {destination && facilities.filter(el => el.location._id === destination).length > 0 && <SelectPicker onChange={setFacility} data={facilities.filter(el => el.location._id === destination)} label="name" placeholder={"Select a Facility (" + facilities.filter(el => el.location._id === destination).length + ") present"} />}
            </Flex>

          </Box>}
          
        </Flex>
        <br />
        <Divider />
        <Flex width={"100%"} >
          <Spacer />
          <Box width={"99%"} >
            Description:
            {10 - description.length > 0 && (
              <Tag variant='solid' style={{ color: 'black' }} colorScheme={'orange'}>
                {10 - description.length} more characters...
              </Tag>
            )}
            {description.length >= maxLength && (
              <Tag variant='solid' style={{ color: 'black' }} colorScheme={'orange'}>
                 too long: ({description.length} / {maxLength})
                
              </Tag>
            )}

            {10 - description.length <= 0 && description.length < maxLength && (
              <Tag variant='solid' colorScheme={'green'}>
                {description.length} / {maxLength}
                <CheckIcon />
              </Tag>
            )}
            <textarea rows='6' value={description} className='textStyle' onChange={(event) => setDescription(event.target.value)} />
          </Box>
          <Spacer />

        </Flex>
        <br />
        {/* Needed Resources:
        <Center>
          {actionType.resourceTypes.map(el => {
            const resources = myAccout.resources.find(e => e.type === el.type);
            return (
              <Box key={el._id}>
                {resources?.balance < el.min && (
                  <Tag variant='solid' style={{ color: 'black' }} colorScheme={'orange'}>
                    Lacking Resources
                  </Tag>
                )}
                {resources == undefined || resources?.balance >= el.min && (
                  <Tag variant='solid'  colorScheme={'green'}>
                    <CheckIcon />
                  </Tag>
                )}
                <ResourceNugget type={el.type} value={el.min} label={`You have ${resources?.balance} ${el.type} resource${resources?.balance > 0 && 's'}`} />
              </Box>)
          }

          )}
        </Center> */}

        <br />

        Assets:
        <br />
        {actionType.assetTypes?.map((type) => (
          <Tag margin={'3px'} key={type} textTransform='capitalize' backgroundColor={getFadedColor(type)} color={getTextColor(type)} variant={'solid'}>
            {type}
          </Tag>
        ))}

        <Flex>
          {assets.map((ass, index) => (
            <>
              <Spacer />
              <Box
                style={{
                  paddingTop: '5px',
                  paddingLeft: '10px',
                  textAlign: 'left',
                  width: '33%'
                }}
              >
                {!ass &&
                  <AddAsset
                    key={index}
                    handleSelect={(ass) => editState(ass, ass.model, index)}
                    assets={myAssets.filter(el => 
                      actionType.assetTypes.some(a => a === el.type || a === el.model) && 
                      (!el.status.some(a => a === 'used' || a === 'working') || el.status.some(a => a === 'multi-use')) &&
                      el.uses > 0 &&
                      !assets.some(ass => ass?._id === el._id || ass === el._id))} 
                    />}
                {ass &&
                  <AssetCard
                    showRemove
                    removeAsset={() => editState(false, 'Asset', index)}
                    compact
                    type={'blueprint'}
                    asset={ass}
                  />}
              </Box>
              <Spacer />
            </>
          ))}
          <Spacer />
        </Flex>
      </form>
      <div
        style={{
          justifyContent: 'end',
          display: 'flex',
          marginTop: '15px',
          textAlign: 'center'
        }}
      >
        <Spacer />

        <VStack>
          {disabledConditions.filter(el => el.disabled).map((opt, index) =>
            <Text color='red' key={index}>{opt.text}</Text>
          )}
        </VStack>

        <Button leftIcon={<Icon as={HiSave} />} colorScheme="green" onClick={() => passSubmit()} variant='solid' loading={loading} isDisabled={isDisabled} >
          <b>Submit</b>
        </Button>
        <Button colorScheme="red" onClick={() => closeNew()} variant='outline'>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default ActionForm;
