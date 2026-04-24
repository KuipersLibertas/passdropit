import React from 'react';
import MainLayout from '@/layouts/Main';

import { default as UserEarningReportView } from '@/views/admin/UserEarningReport';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { IUser } from '@/types';
import { getUserList } from '@/api';
import { UserLevel } from '@/utils/constants';

const UserEarningReport = async (): Promise<JSX.Element> => {
  const session = await getServerSession(authOptions);
  
  if (session === null) {
    redirect('/signin');
  }

  if (session?.user.level != UserLevel.Admin) {
    redirect('/');
  }

  let userList: IUser[] = [];
  try {
    const response = await getUserList();
    userList = response.data;
  } catch (error: any) {
    console.log(error.message);
  }

  return (
    <MainLayout>
      <UserEarningReportView userList={userList} />
    </MainLayout>
  );
};

export default UserEarningReport;