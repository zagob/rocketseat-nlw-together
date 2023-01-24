import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, FlatList } from 'react-native';
import { ButtonAdd } from '../../components/ButtonAdd';
import { CategorySelect } from '../../components/CategorySelect';
import { ListHeader } from '../../components/ListHeader';

import { Profile } from '../../components/Profile';
import { Load } from '../../components/Load';
import { Appointment, AppointmentsProps } from '../../components/Appointment';
import { ListDivider } from '../../components/ListDivider';


import { Background } from '../../components/Background';

import { styles } from './styles';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLLECTION_APPOINTMENTS } from '../../configs/database';
import { useCallback } from 'react';

export function Home() {
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState<AppointmentsProps[]>([]);
    const navigation = useNavigation();

    function handleCategorySelect(categoryId: string) {
        categoryId === category ? setCategory('') : setCategory(categoryId);
    }

    function handleAppointmentDetails(guildSelected: AppointmentsProps) {
        navigation.navigate('AppointmentDetails', { guildSelected })
    }

    function handleAppointmentCreate() {
        navigation.navigate('AppointmentCreate')
    }

    async function loadAppointments() {
        const response = await AsyncStorage.getItem(COLLECTION_APPOINTMENTS);
        const storage: AppointmentsProps[] = response ? JSON.parse(response) : [];

        if (category) {
            setAppointments(storage.filter(item => item.category === category));
        } else {
            setAppointments(storage);
        }
        setLoading(false);
    }

    // ao voltar para tela home, recarregar
    useFocusEffect(useCallback(() => {
        loadAppointments();
    }, [category]))

    return (
        <Background>
            <View style={styles.header}>
                <Profile />
                <ButtonAdd onPress={handleAppointmentCreate} />
            </View>

            <CategorySelect
                categorySelected={category}
                setCategory={handleCategorySelect}
            />
            {
                loading ? (
                    <Load />
                ) : (
                    <>
                        <ListHeader
                            title="Partidas agendadas"
                            subtitle={`Total ${appointments.length}`}
                        />
                        <FlatList
                            data={appointments}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <Appointment
                                    data={item}
                                    onPress={() => handleAppointmentDetails(item)}
                                />
                            )}
                            ItemSeparatorComponent={() => <ListDivider />}
                            contentContainerStyle={{ paddingBottom: 69 }}
                            style={styles.matches}
                            showsVerticalScrollIndicator={false}
                        />
                    </>
                )
            }
        </Background>
    )
}